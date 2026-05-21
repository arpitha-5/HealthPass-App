import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { plansController } from './plans.controller';

const router = Router();

router.use(authenticate);
router.get('/', plansController.getAll);
router.get('/:id', plansController.getById);
router.post('/subscribe', plansController.subscribe);
router.post('/cancel', plansController.cancelSubscription);

export default router;
