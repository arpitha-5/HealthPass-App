import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { billsController } from './bills.controller';
import { billIdSchema, uploadBillSchema } from './bills.schema';

const router = Router();
router.use(authenticate);

router.post('/', validate(uploadBillSchema), billsController.upload);
router.get('/', billsController.list);
router.get('/:id', validate(billIdSchema), billsController.detail);

export default router;
