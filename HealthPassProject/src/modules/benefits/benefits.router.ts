import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { benefitsController } from './benefits.controller';

const router = Router();
router.use(authenticate);
router.get('/', benefitsController.get);

export default router;
