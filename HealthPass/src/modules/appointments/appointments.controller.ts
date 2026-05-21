import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { appointmentsService } from './appointments.service';

export const appointmentsController = {
  searchHospitals: asyncHandler(async (req: Request, res: Response) => {
    const { city, specialty, name } = req.query as Record<string, string | undefined>;
    const data = await appointmentsService.searchHospitals(city, specialty, name);
    res.status(200).json({ success: true, data });
  }),

  getHospitalDetail: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentsService.getHospitalDetail(String(req.params.id));
    res.status(200).json({ success: true, data });
  }),

  getSlots: asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, date } = req.query as Record<string, string | undefined>;
    const data = await appointmentsService.getSlots(String(req.params.hospitalId), doctorId, date);
    res.status(200).json({ success: true, data });
  }),

  book: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentsService.bookAppointment(req.user!.id, {
      hospitalId: req.body.hospitalId,
      doctorId: req.body.doctorId,
      slotId: req.body.slotId,
      familyMemberId: req.body.familyMemberId,
    });
    res.status(201).json({ success: true, data });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentsService.getUserAppointments(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentsService.getAppointmentDetail(
      req.user!.id,
      String(req.params.id)
    );
    res.status(200).json({ success: true, data });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentsService.cancelAppointment(
      req.user!.id,
      String(req.params.id),
      req.body.reason
    );
    res.status(200).json({ success: true, data });
  }),

  reschedule: asyncHandler(async (req: Request, res: Response) => {
    const data = await appointmentsService.rescheduleAppointment(
      req.user!.id,
      String(req.params.id),
      req.body.slotId
    );
    res.status(200).json({ success: true, data });
  }),
};
