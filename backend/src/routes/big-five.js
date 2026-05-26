import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFollowUpFrom } from '../lib/followUpHelper.js';

const router = Router();

const bigFiveSchema = z.object({
  topic: z.string().min(3),
  priorities: z.string().min(1),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const bigFivePatchSchema = z.object({
  topic: z.string().min(3).optional(),
  priorities: z.string().optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const records = await prisma.bigFive.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const record = await prisma.bigFive.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(bigFiveSchema), async (req, res, next) => {
  try {
    const { followUpDate, ...fields } = req.body;
    const record = await prisma.bigFive.create({
      data: {
        ...fields,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        userId: req.user.id,
      },
    });
    if (followUpDate) {
      await createFollowUpFrom(
        'BIG_FIVE',
        record.id,
        req.user.id,
        `Review: ${fields.topic}`,
        followUpDate
      );
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(bigFivePatchSchema), async (req, res, next) => {
  try {
    const record = await prisma.bigFive.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    const { followUpDate, ...rest } = req.body;
    const updated = await prisma.bigFive.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(followUpDate !== undefined
          ? { followUpDate: followUpDate ? new Date(followUpDate) : null }
          : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const record = await prisma.bigFive.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await prisma.followUp.deleteMany({
      where: { sourceType: 'BIG_FIVE', sourceId: req.params.id },
    });
    await prisma.bigFive.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
