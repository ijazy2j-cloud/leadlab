import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../local-modules/db.mjs';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFollowUpFrom } from '../lib/followUpHelper.js';

const router = Router();

const decisionSchema = z.object({
  decision: z.string().min(10),
  q1Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q1Why: z.string().optional().default(''),
  q2Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q2Why: z.string().optional().default(''),
  q3Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q3Why: z.string().optional().default(''),
  q4Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q4Why: z.string().optional().default(''),
  outcome: z.enum(['PROCEED', 'PAUSE', 'AMEND', 'STOP']),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
  followUpNote: z.string().optional().default(''),
});

const decisionPatchSchema = z.object({
  decision: z.string().min(10).optional(),
  q1Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q1Why: z.string().optional(),
  q2Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q2Why: z.string().optional(),
  q3Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q3Why: z.string().optional(),
  q4Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q4Why: z.string().optional(),
  outcome: z.enum(['PROCEED', 'PAUSE', 'AMEND', 'STOP']).optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
  followUpNote: z.string().optional(),
});

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", decision,
              q1_answer AS "q1Answer", q1_why AS "q1Why",
              q2_answer AS "q2Answer", q2_why AS "q2Why",
              q3_answer AS "q3Answer", q3_why AS "q3Why",
              q4_answer AS "q4Answer", q4_why AS "q4Why",
              outcome,
              follow_up_date AS "followUpDate",
              follow_up_note AS "followUpNote",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM ll_decision_log
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
      `SELECT id, user_id AS "userId", decision,
              q1_answer AS "q1Answer", q1_why AS "q1Why",
              q2_answer AS "q2Answer", q2_why AS "q2Why",
              q3_answer AS "q3Answer", q3_why AS "q3Why",
              q4_answer AS "q4Answer", q4_why AS "q4Why",
              outcome,
              follow_up_date AS "followUpDate",
              follow_up_note AS "followUpNote",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM ll_decision_log
       WHERE id = $1 AND user_id = $2`,
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', auth, validate(decisionSchema), async (req, res, next) => {
  try {
    const {
      decision, q1Answer, q1Why, q2Answer, q2Why,
      q3Answer, q3Why, q4Answer, q4Why,
      outcome, followUpDate, followUpNote,
    } = req.body;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO ll_decision_log
         (user_id, decision, q1_answer, q1_why, q2_answer, q2_why,
          q3_answer, q3_why, q4_answer, q4_why, outcome, follow_up_date, follow_up_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, user_id AS "userId", decision,
                 q1_answer AS "q1Answer", q1_why AS "q1Why",
                 q2_answer AS "q2Answer", q2_why AS "q2Why",
                 q3_answer AS "q3Answer", q3_why AS "q3Why",
                 q4_answer AS "q4Answer", q4_why AS "q4Why",
                 outcome,
                 follow_up_date AS "followUpDate",
                 follow_up_note AS "followUpNote",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        req.user.id, decision, q1Answer, q1Why, q2Answer, q2Why,
        q3Answer, q3Why, q4Answer, q4Why, outcome,
        followUpDate ? new Date(followUpDate) : null,
        followUpNote || '',
      ]
    );
    const record = rows[0];
    if (followUpDate) {
      await createFollowUpFrom('DECISION', record.id, req.user.id, decision, followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', auth, validate(decisionPatchSchema), async (req, res, next) => {
  try {
    const pool = getPool();
    const { rows: existing } = await pool.query(
      'SELECT id FROM ll_decision_log WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!existing[0]) return res.status(404).json({ error: 'Not found' });

    const fields = req.body;
    const colMap = {
      decision: 'decision',
      q1Answer: 'q1_answer', q1Why: 'q1_why',
      q2Answer: 'q2_answer', q2Why: 'q2_why',
      q3Answer: 'q3_answer', q3Why: 'q3_why',
      q4Answer: 'q4_answer', q4Why: 'q4_why',
      outcome: 'outcome',
      followUpDate: 'follow_up_date',
      followUpNote: 'follow_up_note',
    };

    const sets = [];
    const vals = [];
    let idx = 1;
    for (const [key, col] of Object.entries(colMap)) {
      if (key in fields) {
        sets.push(`${col} = $${idx++}`);
        vals.push(key === 'followUpDate' && fields[key]
          ? new Date(fields[key])
          : fields[key] ?? null);
      }
    }
    sets.push(`updated_at = now()`);
    vals.push(parseInt(req.params.id, 10), req.user.id);

    const { rows } = await pool.query(
      `UPDATE ll_decision_log SET ${sets.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING id, user_id AS "userId", decision,
                 q1_answer AS "q1Answer", q1_why AS "q1Why",
                 q2_answer AS "q2Answer", q2_why AS "q2Why",
                 q3_answer AS "q3Answer", q3_why AS "q3Why",
                 q4_answer AS "q4Answer", q4_why AS "q4Why",
                 outcome,
                 follow_up_date AS "followUpDate",
                 follow_up_note AS "followUpNote",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
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
      'SELECT id FROM ll_decision_log WHERE id = $1 AND user_id = $2',
      [parseInt(req.params.id, 10), req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query(
      "DELETE FROM ll_follow_up WHERE source_type = 'DECISION' AND source_id = $1",
      [parseInt(req.params.id, 10)]
    );
    await pool.query('DELETE FROM ll_decision_log WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
