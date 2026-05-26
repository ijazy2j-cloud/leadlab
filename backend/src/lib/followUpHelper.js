import { prisma } from './prisma.js';

async function createFollowUpFrom(sourceType, sourceId, userId, commitment, dueDate) {
  return prisma.followUp.create({
    data: {
      userId,
      sourceType,
      sourceId,
      commitment,
      dueDate: new Date(dueDate),
      owner: 'me',
      status: 'OPEN',
    },
  });
}

export { createFollowUpFrom };
