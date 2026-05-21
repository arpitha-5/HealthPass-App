# Appointments Module

## Purpose
Full lifecycle management of doctor/hospital appointments, including booking with free visit logic, cancellation with restoration rules, and rescheduling.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/hospitals` | ✅ | Search hospitals (city, specialty, name) |
| GET | `/api/hospitals/:id` | ✅ | Hospital detail with doctors |
| GET | `/api/hospitals/:hospitalId/slots` | ✅ | Available time slots (filter by doctorId, date) |
| POST | `/api/appointments` | ✅ | Book appointment |
| GET | `/api/appointments` | ✅ | List user's appointments |
| GET | `/api/appointments/:id` | ✅ | Appointment detail |
| PATCH | `/api/appointments/:id/cancel` | ✅ | Cancel appointment |
| PATCH | `/api/appointments/:id/reschedule` | ✅ | Pick a new slot |

## Free Visit Deduction Logic

Controlled by `config.freeVisitPolicy`:

| Policy | When visit is deducted |
|---|---|
| `AT_BOOKING` (default) | Immediately on successful booking |
| `AT_COMPLETION` | Only after hospital marks appointment completed |

```ts
// config/index.ts
freeVisitPolicy: 'AT_BOOKING' // admin can change
```

## Cancellation & Restoration Rules

```
Cancellation window: 2 hours before slot (CANCELLATION_WINDOW_HOURS)

hoursUntilSlot >= 2  AND  freeVisitDeducted = true
  → restore 1 free visit (increment subscription.freeVisitsRemaining)

hoursUntilSlot < 2  OR  no-show
  → no restoration

Hospital cancels
  → free visit always restored (admin flow)
```

All cancellations are recorded in `AuditLog`.

## Files

| File | Responsibility |
|---|---|
| `appointments.schema.ts` | Zod: hospitalId, doctorId, slotId, optional familyMemberId |
| `appointments.repository.ts` | Prisma: hospital search, slot availability, appointment CRUD, free visit counter |
| `appointments.service.ts` | Booking eligibility, deduction logic, cancellation window check, audit log |
| `appointments.controller.ts` | Thin |
| `appointments.router.ts` | 8 routes (hospitals + appointments) |

## Business Rules
- Active subscription is **required** to book
- Slot is marked `isAvailable = false` on booking, restored on cancel/reschedule
- Reschedule does **not** touch free visit counter
