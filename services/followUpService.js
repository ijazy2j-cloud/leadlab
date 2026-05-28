import { getPool } from '../local-modules/db.mjs';

const SELECT_COLS = `
  id, user_id AS "userId", source_type AS "sourceType", source_id AS "sourceId",
  commitment, owner, due_date AS "dueDate", status, outcome,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

async function list(userId, status) {
  const pool = getPool();
  const now = new Date();
  let query = `SELECT ${SELECT_COLS} FROM ll_follow_up WHERE user_id = $1`;
  const vals = [userId];

  if (status === 'OPEN') {
    query += ` AND status = 'OPEN' AND due_date >= $2 ORDER BY due_date ASC`;
    vals.push(now);
  } else if (status === 'OVERDUE') {
    query += ` AND status = 'OPEN' AND due_date < $2 ORDER BY due_date ASC`;
    vals.push(now);
  } else if (status === 'DONE') {
    query += ` AND status = 'DONE' ORDER BY due_date ASC`;
  } else {
    query += ` ORDER BY due_date ASC`;
  }

  const { rows } = await pool.query(query, vals);
  return rows;
}

async function create(userId, { commitment, dueDate, owner, sourceType, sourceId }) {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO ll_follow_up
       (user_id, source_type, source_id, commitment, owner, due_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,'OPEN')
     RETURNING ${SELECT_COLS}`,
    [userId, sourceType, sourceId ?? null, commitment, owner, new Date(dueDate)]
  );
  return rows[0];
}

async function update(id, userId, fields) {
  const pool = getPool();
  const { rows: existing } = await pool.query(
    'SELECT id FROM ll_follow_up WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!existing[0]) return null;

  const colMap = {
    status: 'status', outcome: 'outcome',
    commitment: 'commitment', dueDate: 'due_date', owner: 'owner',
  };
  const sets = [];
  const vals = [];
  let idx = 1;
  for (const [key, col] of Object.entries(colMap)) {
    if (key in fields) {
      sets.push(`${col} = $${idx++}`);
      vals.push(key === 'dueDate' ? new Date(fields[key]) : fields[key]);
    }
  }
  sets.push('updated_at = now()');
  vals.push(id, userId);

  const { rows } = await pool.query(
    `UPDATE ll_follow_up SET ${sets.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx}
     RETURNING ${SELECT_COLS}`,
    vals
  );
  return rows[0];
}

async function remove(id, userId) {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT id FROM ll_follow_up WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!rows[0]) return false;
  await pool.query('DELETE FROM ll_follow_up WHERE id = $1', [id]);
  return true;
}

async function createFromSource(sourceType, sourceId, userId, commitment, dueDate) {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO ll_follow_up
       (user_id, source_type, source_id, commitment, due_date, owner, status)
     VALUES ($1, $2, $3, $4, $5, 'me', 'OPEN')
     RETURNING *`,
    [userId, sourceType, sourceId, commitment, new Date(dueDate)]
  );
  return rows[0];
}

export { list, create, update, remove, createFromSource };
