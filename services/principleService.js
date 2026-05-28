import { getPool } from '../local-modules/db.mjs';

async function list() {
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM ll_principles ORDER BY number ASC');
  return rows;
}

async function get(id) {
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM ll_principles WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const { rows: activities } = await pool.query(
    'SELECT * FROM ll_activities WHERE principle_id = $1',
    [rows[0].id]
  );
  return { ...rows[0], activities };
}

export { list, get };
