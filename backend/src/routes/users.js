import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// No auth — powers the mock login user picker
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, team: true, isAdmin: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

export default router;
