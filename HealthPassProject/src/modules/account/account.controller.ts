import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { accountService } from './account.service';

export const accountController = {
  setup: asyncHandler(async (req: Request, res: Response) => {
    const user = await accountService.setupAccount(req.user!.id, req.body);
    res.status(200).json({ success: true, data: user });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await accountService.getProfile(req.user!.id);
    res.status(200).json({ success: true, data: user });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await accountService.updateProfile(req.user!.id, req.body);
    res.status(200).json({ success: true, data: user });
  }),

  addFamilyMember: asyncHandler(async (req: Request, res: Response) => {
    const member = await accountService.addFamilyMember(req.user!.id, req.body);
    res.status(201).json({ success: true, data: member });
  }),

  getFamilyMembers: asyncHandler(async (req: Request, res: Response) => {
    const members = await accountService.getFamilyMembers(req.user!.id);
    res.status(200).json({ success: true, data: members });
  }),

  removeFamilyMember: asyncHandler(async (req: Request, res: Response) => {
    const result = await accountService.removeFamilyMember(
      req.user!.id,
      String(req.params.memberId)
    );
    res.status(200).json({ success: true, data: result });
  }),
};
