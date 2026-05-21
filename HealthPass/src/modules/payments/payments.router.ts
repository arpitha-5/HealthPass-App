import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { paymentsController } from './payments.controller';
import { confirmPaymentSchema, createSubscriptionSchema } from './payments.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/subscriptions',
  validate(createSubscriptionSchema),
  paymentsController.createSubscription
);
router.get('/subscriptions/active', paymentsController.getActiveSubscription);
router.post('/payments/confirm', validate(confirmPaymentSchema), paymentsController.confirmPayment);
router.get('/payments/history', paymentsController.getHistory);

export default router;
