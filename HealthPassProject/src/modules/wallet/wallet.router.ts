import { type Request, type Response, Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { walletService } from './wallet.service.js';

export const walletController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await walletService.getWallet(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  redeem: asyncHandler(async (req: Request, res: Response) => {
    const { amount, reason } = req.body;
    const data = await walletService.redeemCredits(
      req.user!.id,
      amount,
      reason ?? 'Manual redemption'
    );
    res.status(200).json({ success: true, data });
  }),
};

const redeemSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    reason: z.string().optional(),
  }),
});

const router = Router();
router.use(authenticate);
router.get('/', walletController.get);
router.post('/redeem', validate(redeemSchema), walletController.redeem);

export default router;
