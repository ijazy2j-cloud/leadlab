import { getPool } from '../local-modules/db.mjs';

const SELECT_COLS = `
  id, user_id AS "userId", title, symptoms, diagnosis, treatment,
  follow_up AS "followUp", follow_up_date AS "followUpDate",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

async function list(userId, page = 1) {
  const limit = 20;
  const offset = (Math.max(1, page) - 1) * limit;
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLS} FROM ll_medical_case
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
    `SELECT ${SELECT_COLS} FROM ll_medical_case WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] ?? null;
}

async function create(userId, data) {
  const { title, symptoms, diagnosis, treatment, followUp, followUpDate } = data;
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO ll_medical_case
       (user_id, title, symptoms, diagnosis, treatment, follow_up, follow_up_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING ${SELECT_COLS}`,
    [
      userId, title, symptoms, diagnosis, treatment,
      followUp || '',
      followUpDate ? new Date(followUpDate) : null,
    ]
  );
  return rows[0];
}

async function update(id, userId, fields) {
  const pool = getPool();
  const { rows: existing } = await pool.query(
    'SELECT id FROM ll_medical_case WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!existing[0]) return null;

  const colMap = {
    title: 'title', symptoms: 'symptoms', diagnosis: 'diagnosis',
    treatment: 'treatment', followUp: 'follow_up', followUpDate: 'follow_up_date',
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
  sets.push('updated_at = now()');
  vals.push(id, userId);

  const { rows } = await pool.query(
    `UPDATE ll_medical_case SET ${sets.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING ${SELECT_COLS}`,
    vals
  );
  return rows[0];
}

async function remove(id, userId) {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id FROM ll_medical_case WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!rows[0]) return false;
  await pool.query(
    "DELETE FROM ll_follow_up WHERE source_type = 'MEDICAL' AND source_id = $1",
    [id]
  );
  await pool.query('DELETE FROM ll_medical_case WHERE id = $1', [id]);
  return true;
}

export { list, get, create, update, remove };
