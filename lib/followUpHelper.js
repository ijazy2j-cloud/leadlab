import { getPool } from '../local-modules/db.mjs';

async function createFollowUpFrom(sourceType, sourceId, userId, commitment, dueDate) {
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

export { createFollowUpFrom };
