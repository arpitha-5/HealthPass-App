import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { appointmentsController } from './appointments.controller';
import {
  appointmentIdSchema,
  bookAppointmentSchema,
  cancelSchema,
  getSlotsSchema,
  rescheduleSchema,
  searchHospitalsSchema,
} from './appointments.schema';

const router = Router();
router.use(authenticate);

// Hospitals
router.get('/hospitals', validate(searchHospitalsSchema), appointmentsController.searchHospitals);
router.get('/hospitals/:id', appointmentsController.getHospitalDetail);
router.get(
  '/hospitals/:hospitalId/slots',
  validate(getSlotsSchema),
  appointmentsController.getSlots
);

// Appointments
router.post('/appointments', validate(bookAppointmentSchema), appointmentsController.book);
router.get('/appointments', appointmentsController.list);
router.get('/appointments/:id', validate(appointmentIdSchema), appointmentsController.detail);
router.patch('/appointments/:id/cancel', validate(cancelSchema), appointmentsController.cancel);
router.patch('/appointments/:id/reschedule', validate(rescheduleSchema), appointmentsController.reschedule);

export default router;
