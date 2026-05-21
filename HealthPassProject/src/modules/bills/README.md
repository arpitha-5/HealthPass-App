# Bills Module

## Purpose
Handles medical bill upload, review workflow, and wallet credit calculation.

## Endpoints (User)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/bills` | ✅ | Submit bill for review |
| GET | `/api/bills` | ✅ | List user's bills |
| GET | `/api/bills/:id` | ✅ | Bill detail |

## Admin Endpoints (in admin module)

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/admin/bills` | ADMIN | Pending review queue |
| PATCH | `/api/admin/bills/:id/approve` | ADMIN | Approve + credit wallet |
| PATCH | `/api/admin/bills/:id/reject` | ADMIN | Reject with reason |
| PATCH | `/api/admin/bills/:id/request-info` | ADMIN | Ask for clarification |

## Bill Status Flow

```
SUBMITTED → UNDER_REVIEW → ADMIN_APPROVED → CREDITED
                       ↘ PARTIALLY_APPROVED
                       ↘ REJECTED
                       ↘ MORE_INFO_REQUESTED → resubmit
```

## Upload Validations
- Active membership required
- No duplicate `fileUrl`
- `billDate` must be within last 90 days
- File is a URL (PDF/image served from uploads/ or CDN)

## Credit Calculation Formula

```
credit = billAmount × plan.creditPercentage
subject to:
  maxPerBill   (CreditRule.maxPerBill)
  maxMonthly   (CreditRule.maxMonthly)
  maxAnnual    (CreditRule.maxAnnual)
  minBillAmount threshold
  creditExpiryDays (WalletTransaction.expiresAt)
```

**Seeded defaults:**
| Plan | % | Max/Bill |
|---|---|---|
| BASIC | 5% | ₹500 |
| ADVANCED | 7.5% | ₹500 |
| ENHANCED | 10% | ₹500 |

## Files

| File | Responsibility |
|---|---|
| `bills.schema.ts` | Zod: billType enum, fileUrl URL, optional fields |
| `bills.repository.ts` | Prisma: bill CRUD, wallet credit, CreditRule lookup |
| `bills.service.ts` | Upload validation, approval/rejection, credit capping, audit + notification |
| `bills.controller.ts` | Thin (user-facing) |
| `bills.router.ts` | 3 user-facing routes |

## Notifications Triggered
- `BILL_UPLOADED` → on submit
- `BILL_APPROVED` → on admin approval
- `BILL_REJECTED` → on rejection
