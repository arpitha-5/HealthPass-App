# Account Module

## Purpose
Manages user profile setup, updates, and family member management.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/account/setup` | ✅ | First-time profile setup after OTP |
| GET | `/api/account/profile` | ✅ | Get current user profile |
| PATCH | `/api/account/profile` | ✅ | Update name / email / city / language |
| POST | `/api/account/family` | ✅ | Add a family member |
| GET | `/api/account/family` | ✅ | List family members |
| DELETE | `/api/account/family/:memberId` | ✅ | Remove a family member |

## Flow

```
POST /api/account/setup
  → verify city is supported (config.supportedCities)
  → update User: name, email, language, city, consent, referralCode
  → set isProfileComplete = true

POST /api/account/family
  → count existing members
  → if >= 5  throw AppError(400)
  → create FamilyMember linked to userId
```

## Files

| File | Responsibility |
|---|---|
| `account.schema.ts` | Zod: name min(2), email, city, consentAccepted must be true |
| `account.repository.ts` | Prisma: User update, FamilyMember CRUD |
| `account.service.ts` | City validation, plan-limit guard for family count |
| `account.controller.ts` | Thin req → service → JSON |
| `account.router.ts` | All routes under `authenticate` middleware |

## Business Rules
- City must be in `config.supportedCities` (Hyderabad, Bangalore, Chennai, Mumbai, Delhi, Pune) — currently hardcoded, extendable
- Family member cap: 5 per account (plan-based limits can be enforced later from subscription)
- Consent must explicitly be `true` — Zod `.refine()` enforces this
