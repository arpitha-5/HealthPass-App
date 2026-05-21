import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { chatController } from './chat.controller';

const router = Router();
router.use(authenticate);

const startChatSchema = z.object({ body: z.object({ hospitalId: z.string().min(1) }) });
const sendMsgSchema = z.object({
  params: z.object({ threadId: z.string().min(1) }),
  body: z.object({ content: z.string().min(1) }),
});

router.post('/', validate(startChatSchema), chatController.start);
router.get('/', chatController.getThreads);
router.get('/:threadId/messages', chatController.getMessages);
router.post('/:threadId/messages', validate(sendMsgSchema), chatController.send);

export default router;
