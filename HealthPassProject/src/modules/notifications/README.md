# Notifications Module

## Purpose
Stores and surfaces in-app push notifications for all platform events.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | ✅ | Last 50 notifications (newest first) |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark one as read |
| POST | `/api/notifications/read-all` | ✅ | Mark all unread as read |

## Notification Types (NotificationType enum)

| Type | Trigger |
|---|---|
| `OTP` | OTP sent |
| `PLAN_ACTIVATION` | Subscription activated |
| `APPOINTMENT_BOOKED` | Appointment confirmed |
| `APPOINTMENT_CANCELLED` | Appointment cancelled |
| `APPOINTMENT_RESCHEDULED` | Appointment rescheduled |
| `APPOINTMENT_REMINDER` | Time-based reminder (scheduled job) |
| `BILL_UPLOADED` | Bill submitted |
| `BILL_APPROVED` | Credit granted |
| `BILL_REJECTED` | Bill rejected |
| `WALLET_CREDITED` | Wallet topped up |
| `WALLET_EXPIRING` | Credits expiring soon |
| `INSURANCE_REMINDER` | Premium due reminder |
| `REFERRAL_REWARD` | Referral bonus |
| `GENERAL` | Any admin broadcast |

## How Notifications Are Created
Notifications are created **inside service methods** wherever an event occurs:
```ts
await prisma.notification.create({ data: { userId, type, title, body } });
```
e.g., in `appointments.service.ts`, `bills.service.ts`, etc.

## Extension Points
- **Push notifications**: Call FCM/APNS in `notification.create` helper
- **Email**: Same hook point — add email sending alongside DB insert
- **Scheduled reminders**: A cron job can scan `TimeSlot.date` and insert `APPOINTMENT_REMINDER`

## Files
Lightweight — single `notifications.router.ts` (no repository/service split needed).
