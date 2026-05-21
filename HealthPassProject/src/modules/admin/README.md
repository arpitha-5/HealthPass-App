# Admin Module

## Purpose
Provides admin-only endpoints for bill review, free visit adjustment, and audit log access. All routes require `ADMIN` role.

## Endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/api/admin/bills` | ADMIN | Pending bills queue (SUBMITTED + UNDER_REVIEW) |
| PATCH | `/api/admin/bills/:id/approve` | ADMIN | Approve bill → calc credit → credit wallet |
| PATCH | `/api/admin/bills/:id/reject` | ADMIN | Reject with reason |
| PATCH | `/api/admin/bills/:id/request-info` | ADMIN | Ask user for clarification |
| PATCH | `/api/admin/appointments/:id/adjust-visits` | ADMIN | Manually adjust free visit count |
| GET | `/api/admin/audit-logs` | ADMIN | Paginated audit trail |

## Middleware Stack
```ts
router.use(authenticate, requireRole('ADMIN'))
// Every route is protected with both middlewares
```

## Bill Approval Flow

```
PATCH /api/admin/bills/:id/approve { creditAmount, note }
  → billsService.approveBill()
  → cap credit to CreditRule.maxPerBill
  → update Bill.status = ADMIN_APPROVED
  → get or create Wallet for user
  → WalletTransaction CREDIT → wallet.balance += creditAmount
  → push BILL_APPROVED notification
  → create AuditLog { action: ADMIN_APPROVED, performedBy: adminId }
```

## Free Visit Adjustment
```
PATCH /api/admin/appointments/:id/adjust-visits { adjustment: +1 | -1, reason }
  → find active Subscription for appointment's user
  → subscription.freeVisitsRemaining += adjustment
  → AuditLog { action: ADMIN_FREE_VISIT_ADJUSTMENT }
```

## Audit Log Fields
| Field | Description |
|---|---|
| `entityType` | e.g., "Bill", "Subscription" |
| `entityId` | MongoDB ObjectId of the entity |
| `action` | e.g., "ADMIN_APPROVED", "CANCELLED" |
| `performedBy` | userId of actor |
| `metadata` | JSON — amounts, reasons, flags |

## Files
Single `admin.router.ts` — all logic is delegated to `billsService.*` methods.
