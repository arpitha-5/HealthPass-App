import { z } from 'zod';

export const linkInsuranceSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Insurance company is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    insuredName: z.string().min(1),
    expiryDate: z.string().min(1, 'Expiry date required'),
    premiumDue: z.string().optional(),
  }),
});

export type LinkInsuranceInput = z.infer<typeof linkInsuranceSchema>['body'];
