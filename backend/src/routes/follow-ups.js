import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createSchema = z.object({
  commitment: z.string().min(3),
  dueDate: z.string().datetime(),
  owner: z.string().optional().default('me'),
  sourceType: z.enum(['DECISION', 'MEDICAL', 'BIG_FIVE', 'COACHING', 'MANUAL']).default('MANUAL'),
  sourceId: z.string().optional(),
});

const patchSchema = z.object({
  status: z.enum(['OPEN', 'DONE', 'CANCELLED']).optional(),
  outcome: z.string().optional(),
  commitment: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  owner: z.string().optional(),
});

router.get('/', auth, async (req, res, next) => {
  try {
    const now = new Date();
    let where = { userId: req.user.id };

    if (req.query.status === 'OPEN') {
      where = { ...where, status: 'OPEN', dueDate: { gte: now } };
    } else if (req.query.status === 'OVERDUE') {
      where = { ...where, status: 'OPEN', dueDate: { lt: now } };
    } else if (req.query.status === 'DONE') {
      where = { ...where, status: 'DONE' };
    }

    const records = await prisma.followUp.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(createSchema), async (req, res, next) => {
  try {
    const record = await prisma.followUp.create({
      data: { ...req.body, userId: req.user.id, status: 'OPEN' },
    });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(patchSchema), async (req, res, next) => {
  try {
    const record = await prisma.followUp.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.followUp.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const record = await prisma.followUp.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await prisma.followUp.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
