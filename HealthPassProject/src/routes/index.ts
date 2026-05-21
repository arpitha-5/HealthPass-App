import { Router } from 'express';
import accountRouter from '../modules/account/account.router.js';
import adminRouter from '../modules/admin/admin.router.js';
import appointmentsRouter from '../modules/appointments/appointments.router.js';
import authRouter from '../modules/auth/auth.router.js';
import benefitsRouter from '../modules/benefits/benefits.router.js';
import billsRouter from '../modules/bills/bills.router.js';
import chatRouter from '../modules/chat/chat.router.js';
import dashboardRouter from '../modules/dashboard/dashboard.router.js';
import insuranceRouter from '../modules/insurance/insurance.router.js';
import notificationsRouter from '../modules/notifications/notifications.router.js';
import paymentsRouter from '../modules/payments/payments.router.js';
import plansRouter from '../modules/plans/plans.router.js';
import walletRouter from '../modules/wallet/wallet.router.js';

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
