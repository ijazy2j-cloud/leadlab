import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const principles = await prisma.principle.findMany({ orderBy: { number: 'asc' } });
    res.json(principles);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const principle = await prisma.principle.findUnique({
      where: { id: req.params.id },
      include: { activities: true },
    });
    if (!principle) return res.status(404).json({ error: 'Not found' });
    res.json(principle);
  } catch (err) {
    next(err);
  }
});

export default router;
