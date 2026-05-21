import { z } from 'zod';

export const accountSetupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    language: z.string().min(1, 'Language is required'),
    city: z.string().min(1, 'City is required'),
    consentAccepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms and privacy policy',
    }),
    referralCode: z.string().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    language: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const addFamilyMemberSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    age: z.number().int().min(0).max(120),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    relation: z.string().min(1),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/)
      .optional(),
  }),
});

export const familyMemberIdSchema = z.object({
  params: z.object({
    memberId: z.string().min(1),
  }),
});

export type AccountSetupInput = z.infer<typeof accountSetupSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type AddFamilyMemberInput = z.infer<typeof addFamilyMemberSchema>['body'];
