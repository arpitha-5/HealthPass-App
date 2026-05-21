import type { BillingCycle, PaymentMethod } from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { paymentsRepository } from './payments.repository';
import type { ConfirmPaymentInput, CreateSubscriptionInput } from './payments.schema';

function calcEndDate(start: Date, cycle: BillingCycle): Date {
  const end = new Date(start);
  if (cycle === 'MONTHLY') end.setMonth(end.getMonth() + 1);
  else if (cycle === 'QUARTERLY') end.setMonth(end.getMonth() + 3);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
}

function calcPrice(
  plan: { priceMonthly: number; priceQuarterly: number; priceAnnually: number },
  cycle: BillingCycle
): number {
  if (cycle === 'MONTHLY') return plan.priceMonthly;
  if (cycle === 'QUARTERLY') return plan.priceQuarterly;
  return plan.priceAnnually;
}

export const paymentsService = {
  async createSubscription(userId: string, data: CreateSubscriptionInput) {
    const plan = await paymentsRepository.findPlanById(data.planId);
    if (!plan) throw new AppError('Plan not found', 404);

    const price = calcPrice(plan, data.billingCycle as BillingCycle);
    const subscription = await paymentsRepository.createSubscription(
      userId,
      plan.id,
      data.billingCycle as BillingCycle,
      plan.freeVisits
    );

    // Create pending payment
    const payment = await paymentsRepository.createPayment(userId, subscription.id, price, 0);

    return { subscription, payment, amount: price, plan };
  },

  async getActiveSubscription(userId: string) {
    const sub = await paymentsRepository.getActiveSubscription(userId);
    if (!sub) throw new AppError('No active subscription found', 404);
    return sub;
  },

  async confirmPayment(userId: string, data: ConfirmPaymentInput) {
    const sub = await paymentsRepository.findSubscriptionById(data.subscriptionId);
    if (!sub) throw new AppError('Subscription not found', 404);
    if (sub.userId !== userId) throw new AppError('Unauthorized', 403);

    const walletUsed = data.walletAmountUsed ?? 0;

    // Deduct wallet if used
    if (walletUsed > 0) {
      const wallet = await paymentsRepository.getWallet(userId);
      if (!wallet || wallet.balance < walletUsed)
        throw new AppError('Insufficient wallet balance', 400);
      await paymentsRepository.deductWallet(wallet.id, walletUsed, userId);
    }

    // Simulate payment gateway success
    const plan = await paymentsRepository.findPlanById(sub.planId);
    if (!plan) throw new AppError('Subscription plan not found', 500);
    const price = calcPrice(plan, sub.billingCycle);

    const payment = await paymentsRepository.createPayment(
      userId,
      sub.id,
      price - walletUsed,
      walletUsed
    );
    await paymentsRepository.updatePayment(payment.id, {
      status: 'SUCCESS',
      method: data.method as PaymentMethod,
      txnId: data.txnId,
    });

    // Activate subscription
    const start = new Date();
    const end = calcEndDate(start, sub.billingCycle);
    await paymentsRepository.activateSubscription(sub.id, start, end);

    return { message: 'Payment confirmed. Membership activated!', txnId: data.txnId };
  },

  async getPaymentHistory(userId: string) {
    return paymentsRepository.getPaymentHistory(userId);
  },
};
