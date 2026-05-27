import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createSchema = z.object({
  commitment: z.string().min(3),
  dueDate: z.string().datetime(),
  owner: z.string().optional().default('me'),
  sourceType: z.enum(['DECISION', 'MEDICAL', 'BIG_FIVE', 'COACHING', 'MANUAL']).default('MANUAL'),
  sourceId: z.number().int().optional(),
});

const patchSchema = z.object({
  status: z.enum(['OPEN', 'DONE', 'CANCELLED']).optional(),
  outcome: z.string().optional(),
  commitment: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  owner: z.string().optional(),
});

const SELECT_COLS = `
  id, user_id AS "userId", source_type AS "sourceType", source_id AS "sourceId",
  commitment, owner, due_date AS "dueDate", status, outcome,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

router.get('/', auth, async (req, res, next) => {
  try {
    const pool = getPool();
    const now = new Date();
    let query = `SELECT ${SELECT_COLS} FROM ll_follow_up WHERE user_id = $1`;
    const vals = [req.user.id];

    if (req.query.status === 'OPEN') {
      query += ` AND status = 'OPEN' AND due_date >= $2 ORDER BY due_date ASC`;
      vals.push(now);
    } else if (req.query.status === 'OVERDUE') {
      query += ` AND status = 'OPEN' AND due_date < $2 ORDER BY due_date ASC`;
      vals.push(now);
    } else if (req.query.status === 'DONE') {
      query += ` AND status = 'DONE' ORDER BY due_date ASC`;
    } else {
      query += ` ORDER BY due_date ASC`;
    }

    const { rows } = await pool.query(query, vals);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(createSchema), async (req, res, next) => {
  try {
    const { commitment, dueDate, owner, sourceType, sourceId } = req.body;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO ll_follow_up
         (user_id, source_type, source_id, commitment, owner, due_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,'OPEN')
       RETURNING ${SELECT_COLS}`,
      [req.user.id, sourceType, sourceId ?? null, commitment, owner, new Date(dueDate)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(patchSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows: existing } = await pool.query(
      'SELECT id FROM ll_follow_up WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });

    const colMap = {
      status: 'status', outcome: 'outcome',
      commitment: 'commitment', dueDate: 'due_date', owner: 'owner',
    };
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [key, col] of Object.entries(colMap)) {
      if (key in req.body) {
        sets.push(`${col} = $${idx++}`);
        vals.push(key === 'dueDate' ? new Date(req.body[key]) : req.body[key]);
      }
    }
    sets.push('updated_at = now()');
    vals.push(parseInt(req.params.id, 10), req.user.id);

    const { rows } = await pool.query(
      `UPDATE ll_follow_up SET ${sets.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING ${SELECT_COLS}`,
      vals
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id FROM ll_follow_up WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query('DELETE FROM ll_follow_up WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
