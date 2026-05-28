import { getPool } from '../local-modules/db.mjs';

const SELECT_COLS = `
  id, user_id AS "userId", decision,
  q1_answer AS "q1Answer", q1_why AS "q1Why",
  q2_answer AS "q2Answer", q2_why AS "q2Why",
  q3_answer AS "q3Answer", q3_why AS "q3Why",
  q4_answer AS "q4Answer", q4_why AS "q4Why",
  outcome,
  follow_up_date AS "followUpDate",
  follow_up_note AS "followUpNote",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

async function list(userId, page = 1) {
  const limit = 20;
  const offset = (Math.max(1, page) - 1) * limit;
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLS} FROM ll_decision_log
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}

async function get(id, userId) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLS} FROM ll_decision_log WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] ?? null;
}

async function create(userId, data) {
  const {
    decision, q1Answer, q1Why, q2Answer, q2Why,
    q3Answer, q3Why, q4Answer, q4Why,
    outcome, followUpDate, followUpNote,
  } = data;
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO ll_decision_log
       (user_id, decision, q1_answer, q1_why, q2_answer, q2_why,
        q3_answer, q3_why, q4_answer, q4_why, outcome, follow_up_date, follow_up_note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING ${SELECT_COLS}`,
    [
      userId, decision, q1Answer, q1Why, q2Answer, q2Why,
      q3Answer, q3Why, q4Answer, q4Why, outcome,
      followUpDate ? new Date(followUpDate) : null,
      followUpNote || '',
    ]
  );
  return rows[0];
}

async function update(id, userId, fields) {
  const pool = getPool();
  const { rows: existing } = await pool.query(
    'SELECT id FROM ll_decision_log WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!existing[0]) return null;

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
  vals.push(id, userId);

  const { rows } = await pool.query(
    `UPDATE ll_decision_log SET ${sets.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING ${SELECT_COLS}`,
    vals
  );
  return rows[0];
}

async function remove(id, userId) {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id FROM ll_decision_log WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!rows[0]) return false;
  await pool.query(
    "DELETE FROM ll_follow_up WHERE source_type = 'DECISION' AND source_id = $1",
    [id]
  );
  await pool.query('DELETE FROM ll_decision_log WHERE id = $1', [id]);
  return true;
}

export { list, get, create, update, remove };
