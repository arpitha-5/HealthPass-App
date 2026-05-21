import { Router } from 'express';
import accountRouter from '../modules/account/account.router';
import adminRouter from '../modules/admin/admin.router';
import appointmentsRouter from '../modules/appointments/appointments.router';
import authRouter from '../modules/auth/auth.router';
import benefitsRouter from '../modules/benefits/benefits.router';
import billsRouter from '../modules/bills/bills.router';
import chatRouter from '../modules/chat/chat.router';
import dashboardRouter from '../modules/dashboard/dashboard.router';
import insuranceRouter from '../modules/insurance/insurance.router';
import notificationsRouter from '../modules/notifications/notifications.router';
import paymentsRouter from '../modules/payments/payments.router';
import plansRouter from '../modules/plans/plans.router';
import walletRouter from '../modules/wallet/wallet.router';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

router.use('/auth', authRouter);
router.use('/account', accountRouter);
router.use('/plans', plansRouter);
router.use('/', paymentsRouter); // /subscriptions and /payments
router.use('/dashboard', dashboardRouter);
router.use('/', appointmentsRouter); // /hospitals and /appointments
router.use('/chats', chatRouter);
router.use('/benefits', benefitsRouter);
router.use('/bills', billsRouter);
router.use('/wallet', walletRouter);
router.use('/insurance', insuranceRouter);
router.use('/notifications', notificationsRouter);
router.use('/admin', adminRouter);

export default router;
