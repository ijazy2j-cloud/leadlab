import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../local-modules/db.mjs';
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

const SELECT_COLS = `
  id, user_id AS "userId", title, symptoms, diagnosis, treatment,
  follow_up AS "followUp", follow_up_date AS "followUpDate",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLS} FROM ll_medical_case
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
      `SELECT ${SELECT_COLS} FROM ll_medical_case WHERE id = $1 AND user_id = $2`,
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(medicalSchema), async (req, res, next) => {
  try {
    const { title, symptoms, diagnosis, treatment, followUp, followUpDate } = req.body;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO ll_medical_case
         (user_id, title, symptoms, diagnosis, treatment, follow_up, follow_up_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING ${SELECT_COLS}`,
      [
        req.user.id, title, symptoms, diagnosis, treatment,
        followUp || '',
        followUpDate ? new Date(followUpDate) : null,
      ]
    );
    const record = rows[0];
    if (followUpDate) {
      await createFollowUpFrom('MEDICAL', record.id, req.user.id, title, followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(medicalPatchSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows: existing } = await pool.query(
      'SELECT id FROM ll_medical_case WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });

    const colMap = {
      title: 'title', symptoms: 'symptoms', diagnosis: 'diagnosis',
      treatment: 'treatment', followUp: 'follow_up', followUpDate: 'follow_up_date',
    };
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
      `UPDATE ll_medical_case SET ${sets.join(', ')}
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
      'SELECT id FROM ll_medical_case WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      "DELETE FROM ll_follow_up WHERE source_type = 'MEDICAL' AND source_id = $1",
      [parseInt(req.params.id, 10)]
    );
    await pool.query('DELETE FROM ll_medical_case WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
