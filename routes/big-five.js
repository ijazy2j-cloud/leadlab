import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFollowUpFrom } from '../lib/followUpHelper.js';

const router = Router();

const bigFiveSchema = z.object({
  topic: z.string().min(3),
  priorities: z.string().min(1),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const bigFivePatchSchema = z.object({
  topic: z.string().min(3).optional(),
  priorities: z.string().optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const SELECT_COLS = `
  id, user_id AS "userId", topic, priorities,
  follow_up_date AS "followUpDate",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLS} FROM ll_big_five
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
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
      `SELECT ${SELECT_COLS} FROM ll_big_five WHERE id = $1 AND user_id = $2`,
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(bigFiveSchema), async (req, res, next) => {
  try {
    const { topic, priorities, followUpDate } = req.body;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO ll_big_five (user_id, topic, priorities, follow_up_date)
       VALUES ($1,$2,$3,$4)
       RETURNING ${SELECT_COLS}`,
      [req.user.id, topic, priorities, followUpDate ? new Date(followUpDate) : null]
    );
    const record = rows[0];
    if (followUpDate) {
      await createFollowUpFrom('BIG_FIVE', record.id, req.user.id, `Review: ${topic}`, followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(bigFivePatchSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows: existing } = await pool.query(
      'SELECT id FROM ll_big_five WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });

    const colMap = { topic: 'topic', priorities: 'priorities', followUpDate: 'follow_up_date' };
    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [key, col] of Object.entries(colMap)) {
      if (key in req.body) {
        sets.push(`${col} = $${idx++}`);
        vals.push(key === 'followUpDate' && req.body[key]
          ? new Date(req.body[key])
          : req.body[key] ?? null);
      }
    }
    sets.push('updated_at = now()');
    vals.push(parseInt(req.params.id, 10), req.user.id);

    const { rows } = await pool.query(
      `UPDATE ll_big_five SET ${sets.join(', ')}
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
      'SELECT id FROM ll_big_five WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      "DELETE FROM ll_follow_up WHERE source_type = 'BIG_FIVE' AND source_id = $1",
      [parseInt(req.params.id, 10)]
    );
    await pool.query('DELETE FROM ll_big_five WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
