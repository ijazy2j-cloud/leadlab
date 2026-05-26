import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFollowUpFrom } from '../lib/followUpHelper.js';

const router = Router();

const medicalSchema = z.object({
  title: z.string().min(3),
  symptoms: z.string().min(10),
  diagnosis: z.string().min(10),
  treatment: z.string().min(10),
  followUp: z.string().optional().default(''),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const medicalPatchSchema = z.object({
  title: z.string().min(3).optional(),
  symptoms: z.string().min(10).optional(),
  diagnosis: z.string().min(10).optional(),
  treatment: z.string().min(10).optional(),
  followUp: z.string().optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const records = await prisma.medicalCase.findMany({
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
    const record = await prisma.medicalCase.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(medicalSchema), async (req, res, next) => {
  try {
    const { followUpDate, ...fields } = req.body;
    const record = await prisma.medicalCase.create({
      data: {
        ...fields,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        userId: req.user.id,
      },
    });
    if (followUpDate) {
      await createFollowUpFrom('MEDICAL', record.id, req.user.id, record.title, followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(medicalPatchSchema), async (req, res, next) => {
  try {
    const record = await prisma.medicalCase.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    const { followUpDate, ...rest } = req.body;
    const updated = await prisma.medicalCase.update({
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
    const record = await prisma.medicalCase.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!record) return res.status(404).json({ error: 'Not found' });
    await prisma.followUp.deleteMany({
      where: { sourceType: 'MEDICAL', sourceId: req.params.id },
    });
    await prisma.medicalCase.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
