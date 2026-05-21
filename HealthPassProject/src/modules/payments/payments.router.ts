import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { paymentsController } from './payments.controller.js';
import { confirmPaymentSchema, createSubscriptionSchema } from './payments.schema.js';

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
