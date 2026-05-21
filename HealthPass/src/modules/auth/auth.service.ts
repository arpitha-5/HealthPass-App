import bcrypt from 'bcryptjs';
import { config } from '../../config';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jose';
import { AppError } from '../../utils/AppError';
import { authRepository } from './auth.repository';

/**
 * Simulate OTP sending — replace with MSG91 / Twilio in production
 */
async function sendOtpSms(mobile: string, otp: string): Promise<void> {
  console.log(`[OTP] Sending ${otp} to +91${mobile}`);
  // TODO: integrate SMS gateway
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authService = {
  async sendOtp(mobile: string) {
    // Check for existing block
    const existing = await authRepository.findOtpByMobile(mobile);
    if (existing?.isBlocked && existing.blockedUntil && existing.blockedUntil > new Date()) {
      throw new AppError(
        `Too many attempts. Try again after ${existing.blockedUntil.toISOString()}`,
        429
      );
    }

    // Clear old OTPs
    await authRepository.deleteOtpsByMobile(mobile);

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    await authRepository.createOtp(mobile, hashedOtp, expiresAt);
    await sendOtpSms(mobile, otp);

    return { message: 'OTP sent successfully', expiresInMinutes: config.otp.expiryMinutes };
  },

  async verifyOtp(mobile: string, otp: string) {
    const otpRecord = await authRepository.findOtpByMobile(mobile);

    if (!otpRecord) throw new AppError('No OTP found. Please request a new one.', 400);

    if (otpRecord.isBlocked) throw new AppError('Mobile is temporarily blocked.', 429);

    if (otpRecord.expiresAt < new Date()) throw new AppError('OTP expired', 400);

    const isMatch = await bcrypt.compare(otp, otpRecord.code);
    if (!isMatch) {
      await authRepository.incrementOtpAttempts(otpRecord.id);
      if (otpRecord.attempts + 1 >= config.otp.maxAttempts) {
        const blockedUntil = new Date(Date.now() + config.otp.blockDurationMinutes * 60 * 1000);
        await authRepository.blockOtp(otpRecord.id, blockedUntil);
        throw new AppError('Too many wrong attempts. Blocked for 30 minutes.', 429);
      }
      throw new AppError('Invalid OTP', 400);
    }

    // OTP valid — clean up
    await authRepository.deleteOtpsByMobile(mobile);

    // Get or create user
    let user = await authRepository.findUserByMobile(mobile);
    if (!user) {
      user = await authRepository.createUser(mobile);
    }

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(user.id, user.role),
      signRefreshToken(user.id, user.role),
    ]);

    await authRepository.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      isProfileComplete: user.isProfileComplete,
      userId: user.id,
      role: user.role,
    };
  },

  async refreshTokens(refreshToken: string) {
    let payload: Awaited<ReturnType<typeof verifyRefreshToken>>;
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    if (payload.type !== 'refresh') throw new AppError('Invalid token type', 401);

    const user = await authRepository.findUserById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token revoked', 401);
    }

    const [newAccess, newRefresh] = await Promise.all([
      signAccessToken(user.id, user.role),
      signRefreshToken(user.id, user.role),
    ]);

    await authRepository.saveRefreshToken(user.id, newRefresh);

    return { accessToken: newAccess, refreshToken: newRefresh };
  },

  async logout(userId: string) {
    await authRepository.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  },
};
