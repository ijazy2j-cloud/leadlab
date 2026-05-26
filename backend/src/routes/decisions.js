import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFollowUpFrom } from '../lib/followUpHelper.js';

const router = Router();

const decisionSchema = z.object({
  decision: z.string().min(10),
  q1Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q1Why: z.string().optional().default(''),
  q2Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q2Why: z.string().optional().default(''),
  q3Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q3Why: z.string().optional().default(''),
  q4Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q4Why: z.string().optional().default(''),
  outcome: z.enum(['PROCEED', 'PAUSE', 'AMEND', 'STOP']),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
  followUpNote: z.string().optional().default(''),
});

const decisionPatchSchema = z.object({
  decision: z.string().min(10).optional(),
  q1Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q1Why: z.string().optional(),
  q2Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q2Why: z.string().optional(),
  q3Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q3Why: z.string().optional(),
  q4Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q4Why: z.string().optional(),
  outcome: z.enum(['PROCEED', 'PAUSE', 'AMEND', 'STOP']).optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
  followUpNote: z.string().optional(),
});

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const decisions = await prisma.decisionLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json(decisions);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const record = await prisma.decisionLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(decisionSchema), async (req, res, next) => {
  try {
    const { followUpDate, followUpNote, ...fields } = req.body;
    const record = await prisma.decisionLog.create({
      data: {
        ...fields,
        followUpNote: followUpNote || '',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        userId: req.user.id,
      },
    });
    if (followUpDate) {
      await createFollowUpFrom('DECISION', record.id, req.user.id, fields.decision, followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(decisionPatchSchema), async (req, res, next) => {
  try {
    const record = await prisma.decisionLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    const { followUpDate, ...rest } = req.body;
    const updated = await prisma.decisionLog.update({
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
    const record = await prisma.decisionLog.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await prisma.followUp.deleteMany({
      where: { sourceType: 'DECISION', sourceId: req.params.id },
    });
    await prisma.decisionLog.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
