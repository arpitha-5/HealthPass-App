import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { subscriptionController } from './subscription.controller';

const router = Router();

router.use(authenticate);

// Subscription routes
router.get('/me', subscriptionController.getMySubscription);
router.post('/subscribe', subscriptionController.subscribe);
router.post('/cancel', subscriptionController.cancel);

// Wallet routes
router.get('/wallet', subscriptionController.getWallet);
router.get('/wallet/balance', subscriptionController.getWalletBalance);
router.post('/wallet/apply', subscriptionController.applyWallet);
router.post('/wallet/topup', subscriptionController.topUpWallet);
router.post('/wallet/credit-bill', subscriptionController.creditForBill);

// Benefits
router.get('/benefits', subscriptionController.getBenefits);

export default router;
