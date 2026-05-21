import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { authController } from './auth.controller';
import { refreshTokenSchema, sendOtpSchema, verifyOtpSchema } from './auth.schema';

const router = Router();

router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
