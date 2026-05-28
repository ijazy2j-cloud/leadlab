import { getPool } from '../local-modules/db.mjs';

// Dev-only mock middleware. In production this is replaced by auth-production.js (SSO/JWT).
// If no x-user-id header is present, falls back to the first seeded user (Ravindu Silva)
// so local dev works without manually setting any headers.
async function auth(req, res, next) {
  try {
    const pool = getPool();
    const rawId = req.headers['x-user-id'];
    const userId = parseInt(rawId, 10);

    let query;
    let params;

    if (rawId && Number.isInteger(userId) && userId > 0) {
      query = 'SELECT id, name, email, role, team, is_admin AS "isAdmin" FROM ll_users WHERE id = $1';
      params = [userId];
    } else {
      // No header — use the first seeded user for local dev convenience
      query = 'SELECT id, name, email, role, team, is_admin AS "isAdmin" FROM ll_users ORDER BY id ASC LIMIT 1';
      params = [];
    }

    const { rows } = await pool.query(query, params);
    if (!rows[0]) {
      return res.status(401).json({ error: 'No users in database. Run npm run db:seed.' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

export { auth };
