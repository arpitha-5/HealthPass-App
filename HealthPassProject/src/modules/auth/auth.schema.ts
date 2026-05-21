import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits, starts with 6-9)'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
  }),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>['body'];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body'];
