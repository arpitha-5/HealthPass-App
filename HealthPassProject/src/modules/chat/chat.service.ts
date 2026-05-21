import { AppError } from '../../utils/AppError';
import { chatRepository } from './chat.repository';

export const chatService = {
  async startChat(userId: string, hospitalId: string) {
    return chatRepository.findOrCreateThread(userId, hospitalId);
  },

  async getThreads(userId: string) {
    return chatRepository.getThreadsByUser(userId);
  },

  async getMessages(userId: string, threadId: string) {
    const thread = await chatRepository.getThreadById(threadId);
    if (!thread) throw new AppError('Chat thread not found', 404);
    if (thread.userId !== userId) throw new AppError('Unauthorized', 403);
    return chatRepository.getMessages(threadId);
  },

  async sendMessage(userId: string, threadId: string, content: string) {
    const thread = await chatRepository.getThreadById(threadId);
    if (!thread) throw new AppError('Thread not found', 404);
    if (!thread.isActive) throw new AppError('Chat is disabled for this hospital', 400);
    return chatRepository.createMessage(threadId, 'USER', userId, content);
  },
};
