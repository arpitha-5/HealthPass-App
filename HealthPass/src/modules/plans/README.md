# Plans Module

## Purpose
Provides read-only access to available membership plans.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/plans` | ✅ | List all active plans |
| GET | `/api/plans/:id` | ✅ | Get plan detail (features JSON) |

## Plan Tiers

| Plan | Price/Month | Free Visits | Wallet Cashback |
|---|---|---|---|
| BASIC | ₹499 | 3 | 5% |
| ADVANCED | ₹999 | 6 | 7.5% |
| ENHANCED | ₹1,999 | 12 | 10% |

## Files

| File | Responsibility |
|---|---|
| `plans.repository.ts` | Prisma: findAllActive, findById |
| `plans.service.ts` | 404 guard on single plan lookup |
| `plans.controller.ts` | Thin |
| `plans.router.ts` | GET / and GET /:id |

## Features JSON Shape (example)
```json
{
  "doctorVisits": 6,
  "diagnosticDiscount": "25%",
  "accidentalCover": "₹1,00,000",
  "hospitalNetwork": "Premium Network",
  "walletCredits": "7.5% on bills",
  "telemedicine": true,
  "insuranceTracking": true
}
```
Plans are seeded via `pnpm db:seed`.
