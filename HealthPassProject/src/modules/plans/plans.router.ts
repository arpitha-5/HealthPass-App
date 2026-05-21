import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { plansController } from './plans.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', plansController.getAll);
router.get('/:id', plansController.getById);

export default router;
