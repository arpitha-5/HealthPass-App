# Wallet Module

## Purpose
Manages user wallet balance — displays credits earned from bills, and allows redemption during checkout.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/wallet` | ✅ | Balance + last 20 transactions |
| POST | `/api/wallet/redeem` | ✅ | Redeem credits (manual deduction) |

## Response Shape (GET /wallet)

```json
{
  "id": "...",
  "userId": "...",
  "balance": 1500.00,
  "transactions": [
    {
      "id": "...",
      "amount": 300,
      "type": "CREDIT",
      "reason": "Bill credit for DIAGNOSTIC",
      "expiresAt": "2027-03-15T00:00:00.000Z",
      "createdAt": "2026-03-15T00:00:00.000Z"
    }
  ]
}
```

## Transaction Types (WalletTransactionType enum)
| Type | Trigger |
|---|---|
| `CREDIT` | Bill approved → credit added |
| `DEBIT` | Redemption / subscription payment |
| `EXPIRY` | Scheduled expiry job (future) |
| `REVERSAL` | Bill reversed by admin |

## Business Rules
- Credits cannot be converted to cash
- Credits cannot exceed order value during checkout
- `Wallet` record auto-created on first GET if not exists
- Expiry enforcement (scheduled jobs) is an extension point

## Files

| File | Responsibility |
|---|---|
| `wallet.service.ts` | Get/create wallet, redeem with balance check |
| `wallet.router.ts` | Router + controller combined (simple module) |
