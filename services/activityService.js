import { getPool } from '../local-modules/db.mjs';

async function list(principleId) {
  const pool = getPool();
  if (principleId) {
    const { rows } = await pool.query(
      'SELECT * FROM ll_activities WHERE principle_id = $1',
      [principleId]
    );
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM ll_activities');
  return rows;
}

export { list };
