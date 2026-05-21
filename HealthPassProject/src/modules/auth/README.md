# Auth Module

## Purpose
Handles mobile-based OTP authentication and JWT token lifecycle.

## Flow

```
POST /api/auth/send-otp
  → validate mobile (Zod)
  → check block status
  → generate 6-digit OTP
  → bcrypt hash + store in OtpAttempt
  → send via SMS (console.log in dev)

POST /api/auth/verify-otp
  → validate OTP
  → check expiry + attempts
  → issue JOSE access token (15m) + refresh token (7d)
  → store refreshToken hash in User

POST /api/auth/refresh
  → verify refresh token with JOSE
  → rotate both tokens

POST /api/auth/logout
  → authenticate middleware
  → clear refreshToken from User
```

## Files

| File | Responsibility |
|---|---|
| `auth.schema.ts` | Zod: mobile regex, 6-digit OTP |
| `auth.repository.ts` | Prisma: OtpAttempt CRUD, User find/create/update |
| `auth.service.ts` | OTP gen, bcrypt compare, block logic, JWT issuance |
| `auth.controller.ts` | Thin: parse req → call service → JSON |
| `auth.router.ts` | Routes + validate() middleware |

## Security Rules
- OTP expires in `OTP_EXPIRY_MINUTES` (default 10 min)
- Max `OTP_MAX_ATTEMPTS` (default 5) wrong attempts → 30-min block
- Refresh tokens are rotated on every use (stored in DB for validation)

## Zod Schemas
```ts
sendOtpSchema   → body.mobile: /^[6-9]\d{9}$/
verifyOtpSchema → body.mobile + body.otp: 6 chars
refreshTokenSchema → body.refreshToken: min(1)
```
