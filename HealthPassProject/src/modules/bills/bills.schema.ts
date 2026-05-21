import { z } from 'zod';

export const uploadBillSchema = z.object({
  body: z.object({
    billType: z.enum(['MEDICAL_CONSULTATION', 'PHARMACY', 'DIAGNOSTIC', 'HOSPITAL']),
    fileUrl: z.string().url('Must be a valid file URL'),
    providerName: z.string().optional(),
    billAmount: z.number().positive().optional(),
    billDate: z.string().optional(),
    patientName: z.string().optional(),
  }),
});

export const billIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export type UploadBillInput = z.infer<typeof uploadBillSchema>['body'];
