import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().min(1, 'Plan ID is required'),
    billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    subscriptionId: z.string().min(1),
    method: z.enum(['UPI', 'CARD', 'NETBANKING', 'WALLET']),
    txnId: z.string().min(1),
    walletAmountUsed: z.number().min(0).optional(),
  }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>['body'];
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>['body'];
