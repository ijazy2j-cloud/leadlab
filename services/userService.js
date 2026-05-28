import { getPool } from '../local-modules/db.mjs';

async function listAll() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, name, email, role, team, is_admin AS "isAdmin"
     FROM ll_users
     ORDER BY name ASC`
  );
  return rows;
}

export { listAll };
