import prisma from '../../lib/prisma';

export const chatRepository = {
  async findOrCreateThread(userId: string, hospitalId: string) {
    let thread = await prisma.chatThread.findFirst({
      where: { userId, hospitalId, isActive: true },
    });
    if (!thread) {
      thread = await prisma.chatThread.create({ data: { userId, hospitalId } });
    }
    return thread;
  },

  async getThreadsByUser(userId: string) {
    return prisma.chatThread.findMany({
      where: { userId },
      include: { hospital: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getThreadById(id: string) {
    return prisma.chatThread.findUnique({ where: { id }, include: { hospital: true } });
  },

  async getMessages(threadId: string) {
    return prisma.chatMessage.findMany({ where: { threadId }, orderBy: { createdAt: 'asc' } });
  },

  async createMessage(
    threadId: string,
    senderType: 'USER' | 'HOSPITAL' | 'SYSTEM',
    senderId: string,
    content: string
  ) {
    const msg = await prisma.chatMessage.create({
      data: { threadId, senderType, senderId, content },
    });
    await prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
    return msg;
  },
};
