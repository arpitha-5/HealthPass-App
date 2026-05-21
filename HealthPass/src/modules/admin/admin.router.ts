import { type Request, type Response, Router } from 'express';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { AppError } from '../../utils/AppError';
import { asyncHandler } from '../../utils/asyncHandler';
import { billsService } from '../bills/bills.service';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

// ──── Zod Schemas ────
const approveBillSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    creditAmount: z.number().positive(),
    note: z.string().optional(),
  }),
});

const rejectBillSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ reason: z.string().min(1, 'Rejection reason required') }),
});

const requestInfoSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ note: z.string().min(1) }),
});

const adjustVisitsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    adjustment: z.number().int(),
    reason: z.string().min(1),
  }),
});

// ──── Admin Bills ────
router.get(
  '/bills',
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await billsService.getPendingBills();
    res.status(200).json({ success: true, data });
  })
);

router.patch(
  '/bills/:id/approve',
  validate(approveBillSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await billsService.approveBill(
      String(req.params.id),
      req.user!.id,
      req.body.creditAmount,
      req.body.note
    );
    res.status(200).json({ success: true, data });
  })
);

router.patch(
  '/bills/:id/reject',
  validate(rejectBillSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await billsService.rejectBill(
      String(req.params.id),
      req.user!.id,
      req.body.reason
    );
    res.status(200).json({ success: true, data });
  })
);

router.patch(
  '/bills/:id/request-info',
  validate(requestInfoSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data = await billsService.requestMoreInfo(
      String(req.params.id),
      req.user!.id,
      req.body.note
    );
    res.status(200).json({ success: true, data });
  })
);

// ──── Admin Appointments ────
router.patch(
  '/appointments/:id/adjust-visits',
  validate(adjustVisitsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const appt = await prisma.appointment.findUnique({ where: { id: String(req.params.id) } });
    if (!appt) throw new AppError('Appointment not found', 404);

    const sub = await prisma.subscription.findFirst({
      where: { userId: appt.userId, status: 'ACTIVE' },
    });
    if (!sub) throw new AppError('No active subscription found for user', 404);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { freeVisitsRemaining: { increment: req.body.adjustment } },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'Subscription',
        entityId: sub.id,
        action: 'ADMIN_FREE_VISIT_ADJUSTMENT',
        performedBy: req.user!.id,
        metadata: { adjustment: req.body.adjustment, reason: req.body.reason },
      },
    });

    res.status(200).json({ success: true, data: { message: 'Free visits adjusted' } });
  })
);

// ──── Audit Logs ────
router.get(
  '/audit-logs',
  asyncHandler(async (req: Request, res: Response) => {
    const { entityType, page = '1', limit = '20' } = req.query as Record<string, string>;
    const logs = await prisma.auditLog.findMany({
      where: entityType ? { entityType } : {},
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      take: parseInt(limit, 10),
    });
    res.status(200).json({ success: true, data: logs });
  })
);

export default router;
