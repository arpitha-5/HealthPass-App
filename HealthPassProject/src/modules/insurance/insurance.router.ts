import { type Request, type Response, Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { linkInsuranceSchema } from './insurance.schema';

const router = Router();
router.use(authenticate);

router.post(
  '/',
  validate(linkInsuranceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { company, policyNumber, insuredName, expiryDate, premiumDue } = req.body;
    const insurance = await prisma.insurance.create({
      data: {
        userId: req.user!.id,
        company,
        policyNumber,
        insuredName,
        expiryDate: new Date(expiryDate),
        premiumDue: premiumDue ? new Date(premiumDue) : undefined,
        status: 'PENDING_VERIFICATION',
      },
    });
    res.status(201).json({ success: true, data: insurance });
  })
);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const insurances = await prisma.insurance.findMany({ where: { userId: req.user!.id } });
    res.status(200).json({ success: true, data: insurances });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const ins = await prisma.insurance.findFirst({ where: { id, userId: req.user!.id } });
    if (!ins) throw new AppError('Insurance not found', 404);
    await prisma.insurance.delete({ where: { id } });
    res.status(200).json({ success: true, data: { message: 'Insurance unlinked' } });
  })
);

export default router;
