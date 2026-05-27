import { Router } from 'express';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT * FROM ll_principles ORDER BY number ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT * FROM ll_principles WHERE id = $1',
      [parseInt(req.params.id, 10)]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    const { rows: activities } = await pool.query(
      'SELECT * FROM ll_activities WHERE principle_id = $1',
      [rows[0].id]
    );
    res.json({ ...rows[0], activities });
  } catch (err) {
    next(err);
  }
});

export default router;
