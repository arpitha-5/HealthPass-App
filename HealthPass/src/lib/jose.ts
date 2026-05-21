import { jwtVerify, SignJWT } from 'jose';

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? 'fallback_access_secret_change_me'
);
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'fallback_refresh_secret_change_me'
);

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

export interface TokenPayload {
  sub: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Sign an access token (15 min default)
 */
export async function signAccessToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ role, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(accessSecret);
}

/**
 * Sign a refresh token (7d default)
 */
export async function signRefreshToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ role, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(refreshSecret);
}

/**
 * Verify an access token and return payload
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret);
  return {
    sub: payload.sub as string,
    role: payload.role as string,
    type: payload.type as 'access',
  };
}

/**
 * Verify a refresh token and return payload
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, refreshSecret);
  return {
    sub: payload.sub as string,
    role: payload.role as string,
    type: payload.type as 'refresh',
  };
}
