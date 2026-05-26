import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const where = req.query.principleId ? { principleId: req.query.principleId } : {};
    const activities = await prisma.activity.findMany({ where });
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

export default router;
