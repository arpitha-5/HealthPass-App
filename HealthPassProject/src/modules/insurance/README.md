# Insurance Module

## Purpose
Allows users to link existing health insurance policies for premium tracking, claim status, and renewal reminders.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/insurance` | ✅ | Link a policy |
| GET | `/api/insurance` | ✅ | List linked policies |
| DELETE | `/api/insurance/:id` | ✅ | Unlink a policy |

## Request Body (POST)

```json
{
  "company": "Star Health",
  "policyNumber": "SH-2024-123456",
  "insuredName": "Ravi Kumar",
  "expiryDate": "2026-12-31",
  "premiumDue": "2026-11-01"
}
```

## Insurance Status (InsuranceStatus enum)
| Status | Meaning |
|---|---|
| `PENDING_VERIFICATION` | Just linked, not yet verified |
| `ACTIVE` | Verified and active |
| `EXPIRED` | Policy past expiry |

## Extension Points
- **Real-time verification**: Hook `POST /insurance` to an insurance company API/panel before setting status to `ACTIVE`
- **Claim tracking**: Add a `claims` relation for tracking filed/settled/rejected claims
- **Reminders**: Scheduled job reads `premiumDue` and creates `INSURANCE_REMINDER` notifications

## Files
All in a single `insurance.router.ts` (lightweight module — 3 routes, no service/repository layer needed at this complexity).

## Zod Schema
```ts
linkInsuranceSchema → company, policyNumber, insuredName, expiryDate (string), premiumDue? (string)
```
