# Payments Module

## Purpose
Handles membership plan subscription selection, payment confirmation, and wallet deduction.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/subscriptions` | ✅ | Select plan + billing cycle → create pending subscription + payment |
| GET | `/api/subscriptions/active` | ✅ | Get current active subscription |
| POST | `/api/payments/confirm` | ✅ | Confirm payment → activate subscription |
| GET | `/api/payments/history` | ✅ | Payment history list |

## Flow

```
POST /api/subscriptions
  → find plan by ID
  → calculate price (monthly / quarterly / annual)
  → create Subscription (status: PENDING)
  → create Payment (status: PENDING)
  → return { subscription, payment, amount }

POST /api/payments/confirm
  → if walletAmountUsed > 0 → deduct wallet (WalletTransaction DEBIT)
  → update Payment: status=SUCCESS, method, txnId
  → calculate endDate based on billingCycle:
       MONTHLY  → +1 month
       QUARTERLY → +3 months
       ANNUAL   → +1 year
  → update Subscription: status=ACTIVE, startDate, endDate
```

## Files

| File | Responsibility |
|---|---|
| `payments.schema.ts` | Zod: planId, billingCycle enum, method enum |
| `payments.repository.ts` | Prisma: subscription/payment CRUD, wallet deduction |
| `payments.service.ts` | Price calc, date calc, payment gateway stub |
| `payments.controller.ts` | Thin |
| `payments.router.ts` | Routes (note: subscriptions & payments share one router) |

## Business Rules
- Wallet credits can optionally be applied at checkout (`walletAmountUsed`)
- Payment gateway is **stubbed** — wire Razorpay / Stripe by replacing the confirm flow
- Subscription `freeVisitsRemaining` is seeded from `plan.freeVisits` at creation
