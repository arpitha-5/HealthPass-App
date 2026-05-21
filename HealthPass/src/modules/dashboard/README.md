# Dashboard Module

## Purpose
Aggregates all key user data into a single API response for the home screen.

## Endpoint

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | ✅ | Full dashboard data |

## Response Shape

```json
{
  "user": { "name", "mobile", "city" },
  "membership": {
    "plan": "Advanced",
    "status": "ACTIVE",
    "validUntil": "2026-12-31",
    "freeVisitsRemaining": 4
  },
  "familyMembersCount": 2,
  "wallet": { "balance": 1500 },
  "linkedInsurances": 1,
  "upcomingAppointments": [...],
  "nearbyHospitals": [...]
}
```

## Implementation

All queries run **in parallel** via `Promise.all()`:
- `getActiveSubscription(userId)`
- `getFamilyCount(userId)`
- `getWallet(userId)`
- `getInsurances(userId)`
- `getUpcomingAppointments(userId)` — next 5 booked
- `getNearbyHospitals(city)` — top 5 in user's city

If no active subscription → `"membership": null`

## Files

| File | Responsibility |
|---|---|
| `dashboard.repository.ts` | 6 parallel Prisma queries |
| `dashboard.service.ts` | Promise.all composition, data shaping |
| `dashboard.controller.ts` | Thin |
| `dashboard.router.ts` | GET / |
