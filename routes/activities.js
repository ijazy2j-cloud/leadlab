import { Router } from 'express';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const pool = getPool();
    if (req.query.principleId) {
      const { rows } = await pool.query(
        'SELECT * FROM ll_activities WHERE principle_id = $1',
        [parseInt(req.query.principleId, 10)]
      );
      return res.json(rows);
    }
    const { rows } = await pool.query('SELECT * FROM ll_activities');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
