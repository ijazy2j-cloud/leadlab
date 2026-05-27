import { Router } from 'express';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';

const router = Router();

// No auth — powers the mock login user picker
router.get('/', async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, name, email, role, team, is_admin AS "isAdmin"
       FROM ll_users
       ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

export default router;
