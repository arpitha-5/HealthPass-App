import { config } from '../../config';
import prisma from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { appointmentsRepository } from './appointments.repository';

const CANCELLATION_WINDOW_HOURS = 2; // Configurable

export const appointmentsService = {
  async searchHospitals(city?: string, specialty?: string, name?: string) {
    return appointmentsRepository.searchHospitals(city, specialty, name);
  },

  async getHospitalDetail(id: string) {
    const hospital = await appointmentsRepository.findHospitalById(id);
    if (!hospital) throw new AppError('Hospital not found', 404);
    return hospital;
  },

  async getSlots(hospitalId: string, doctorId?: string, date?: string) {
    return appointmentsRepository.getAvailableSlots(hospitalId, doctorId, date);
  },

  async bookAppointment(
    userId: string,
    data: { hospitalId: string; doctorId: string; slotId: string; familyMemberId?: string }
  ) {
    // Check active subscription
    const subscription = await appointmentsRepository.getActiveSubscription(userId);
    if (!subscription) throw new AppError('Active membership required to book appointments', 403);

    // Check valid family member if booking for others
    if (data.familyMemberId) {
      const familyMember = await appointmentsRepository.findFamilyMemberById(
        data.familyMemberId,
        userId
      );
      if (!familyMember) throw new AppError('Invalid family member', 400);
    }

    // Check slot
    const slot = await appointmentsRepository.findSlotById(data.slotId);
    if (!slot || !slot.isAvailable) throw new AppError('Slot is not available', 400);

    // Check hospital is covered by plan
    const hospital = await appointmentsRepository.findHospitalById(data.hospitalId);
    if (!hospital || !hospital.isActive) throw new AppError('Hospital not found or inactive', 404);

    const freeVisitPolicy = config.freeVisitPolicy;
    let freeVisitDeducted = false;

    // Deduct free visit at booking if policy says AT_BOOKING
    if (freeVisitPolicy === 'AT_BOOKING' && subscription.freeVisitsRemaining > 0) {
      await appointmentsRepository.decrementFreeVisits(subscription.id);
      freeVisitDeducted = true;
    }

    // Mark slot unavailable
    await appointmentsRepository.markSlotUnavailable(data.slotId);

    const appointment = await appointmentsRepository.createAppointment({
      userId,
      hospitalId: data.hospitalId,
      doctorId: data.doctorId,
      slotId: data.slotId,
      familyMemberId: data.familyMemberId,
      freeVisitDeducted,
      freeVisitPolicy,
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'APPOINTMENT_BOOKED',
        title: 'Appointment Confirmed',
        body: `Your appointment at ${hospital.name} has been booked.`,
      },
    });

    return appointment;
  },

  async getUserAppointments(userId: string) {
    return appointmentsRepository.getUserAppointments(userId);
  },

  async getAppointmentDetail(userId: string, appointmentId: string) {
    const appt = await appointmentsRepository.getAppointmentById(appointmentId);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.userId !== userId) throw new AppError('Unauthorized', 403);
    return appt;
  },

  async cancelAppointment(userId: string, appointmentId: string, reason?: string) {
    const appt = await appointmentsRepository.getAppointmentById(appointmentId);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.userId !== userId) throw new AppError('Unauthorized', 403);
    if (appt.status !== 'BOOKED')
      throw new AppError('Only BOOKED appointments can be cancelled', 400);

    // Check slot time has not passed
    const slotDate = new Date(appt.slot.date);
    if (slotDate < new Date()) throw new AppError('Cannot cancel a past appointment', 400);

    await appointmentsRepository.updateAppointmentStatus(appointmentId, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
    });

    // Free slot
    await appointmentsRepository.markSlotAvailable(appt.slotId);

    // Restore free visit if within cancellation window
    const hoursUntilSlot = (slotDate.getTime() - Date.now()) / (1000 * 60 * 60);
    const withinWindow = hoursUntilSlot >= CANCELLATION_WINDOW_HOURS;

    if (appt.freeVisitDeducted && withinWindow) {
      const subscription = await appointmentsRepository.getActiveSubscription(userId);
      if (subscription) {
        await appointmentsRepository.incrementFreeVisits(subscription.id);
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Appointment',
        entityId: appointmentId,
        action: 'CANCELLED',
        performedBy: userId,
        metadata: { reason, freeVisitRestored: appt.freeVisitDeducted && withinWindow },
      },
    });

    return { message: 'Appointment cancelled successfully' };
  },

  async rescheduleAppointment(userId: string, appointmentId: string, newSlotId: string) {
    const appt = await appointmentsRepository.getAppointmentById(appointmentId);
    if (!appt) throw new AppError('Appointment not found', 404);
    if (appt.userId !== userId) throw new AppError('Unauthorized', 403);
    if (appt.status !== 'BOOKED') throw new AppError('Cannot reschedule this appointment', 400);

    const newSlot = await appointmentsRepository.findSlotById(newSlotId);
    if (!newSlot || !newSlot.isAvailable) throw new AppError('New slot is not available', 400);

    // Restore old slot
    await appointmentsRepository.markSlotAvailable(appt.slotId);
    // Mark new slot
    await appointmentsRepository.markSlotUnavailable(newSlotId);

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { slotId: newSlotId, status: 'RESCHEDULED' },
    });

    return { message: 'Appointment rescheduled successfully' };
  },
};
