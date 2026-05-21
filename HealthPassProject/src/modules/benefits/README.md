# Benefits Module

## Purpose
Returns the user's plan entitlements with used vs remaining counters.

## Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/benefits` | ✅ | Full benefit breakdown for active plan |

## Response Shape

```json
{
  "active": true,
  "plan": "Advanced",
  "validUntil": "2026-12-31T00:00:00.000Z",
  "benefits": {
    "freeVisits": {
      "total": 6,
      "used": 2,
      "remaining": 4
    },
    "walletCredits": {
      "balance": 1200,
      "currency": "INR"
    },
    "features": {
      "diagnosticDiscount": "25%",
      "accidentalCover": "₹1,00,000",
      ...
    }
  }
}
```

If no active subscription:
```json
{ "active": false, "message": "No active subscription found" }
```

## Implementation Notes
- `freeVisits.used = plan.freeVisits - subscription.freeVisitsRemaining`
- `walletCredits.balance` from `Wallet` model (0 if wallet not yet created)
- `features` is the raw `Plan.features` JSON field — structured per plan type

## Files

| File | Responsibility |
|---|---|
| `benefits.service.ts` | Parallel queries + shape building (no separate repository needed) |
| `benefits.controller.ts` | Thin |
| `benefits.router.ts` | Single GET / |
