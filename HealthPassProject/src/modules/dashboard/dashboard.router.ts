import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { dashboardController } from './dashboard.controller';

const router = Router();
router.use(authenticate);
router.get('/', dashboardController.get);

export default router;
