import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { chatService } from './chat.service';

export const chatController = {
  start: asyncHandler(async (req: Request, res: Response) => {
    const { hospitalId } = req.body;
    const data = await chatService.startChat(req.user!.id, hospitalId);
    res.status(201).json({ success: true, data });
  }),

  getThreads: asyncHandler(async (req: Request, res: Response) => {
    const data = await chatService.getThreads(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  getMessages: asyncHandler(async (req: Request, res: Response) => {
    const data = await chatService.getMessages(req.user!.id, String(req.params.threadId));
    res.status(200).json({ success: true, data });
  }),

  send: asyncHandler(async (req: Request, res: Response) => {
    const data = await chatService.sendMessage(
      req.user!.id,
      String(req.params.threadId),
      req.body.content
    );
    res.status(201).json({ success: true, data });
  }),
};
