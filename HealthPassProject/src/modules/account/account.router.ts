import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { accountController } from './account.controller';
import {
  accountSetupSchema,
  addFamilyMemberSchema,
  familyMemberIdSchema,
  updateProfileSchema,
} from './account.schema';

const router = Router();

router.use(authenticate);

router.post('/setup', validate(accountSetupSchema), accountController.setup);
router.get('/profile', accountController.getProfile);
router.patch('/profile', validate(updateProfileSchema), accountController.updateProfile);
router.post('/family', validate(addFamilyMemberSchema), accountController.addFamilyMember);
router.get('/family', accountController.getFamilyMembers);
router.delete(
  '/family/:memberId',
  validate(familyMemberIdSchema),
  accountController.removeFamilyMember
);

export default router;
