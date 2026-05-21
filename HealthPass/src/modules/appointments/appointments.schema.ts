import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  body: z.object({
    hospitalId: z.string().min(1),
    doctorId: z.string().min(1),
    slotId: z.string().min(1),
    familyMemberId: z.string().optional(),
  }),
});

export const appointmentIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const rescheduleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ slotId: z.string().min(1) }),
});

export const cancelSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ reason: z.string().optional() }),
});

export const searchHospitalsSchema = z.object({
  query: z.object({
    city: z.string().optional(),
    specialty: z.string().optional(),
    name: z.string().optional(),
  }),
});

export const getSlotsSchema = z.object({
  params: z.object({ hospitalId: z.string().min(1) }),
  query: z.object({ doctorId: z.string().optional(), date: z.string().optional() }),
});
