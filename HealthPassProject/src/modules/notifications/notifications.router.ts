import { type Request, type Response, Router } from 'express';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.status(200).json({ success: true, data: notifications });
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const notif = await prisma.notification.findFirst({
      where: { id, userId: req.user?.id },
    });
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.status(200).json({ success: true, data: { message: 'Marked as read' } });
  })
);

router.post(
  '/read-all',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.notification.updateMany({
      where: { userId: req.user?.id, isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({ success: true, data: { message: 'All notifications marked as read' } });
  })
);

export default router;
