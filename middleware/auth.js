import { getPool } from '../local-modules/db.mjs';

// TODO: replace with HSBC SSO middleware later.
// This is the only place that identifies a user — swap the body of this function
// when SSO is ready; all routes stay unchanged.
async function auth(req, res, next) {
  const rawId = req.headers['x-user-id'];
  const userId = parseInt(rawId, 10);
  if (!rawId || !Number.isInteger(userId) || userId <= 0) {
    return res.status(401).json({ error: 'No user authenticated' });
  }
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id, name, email, role, team, is_admin AS "isAdmin" FROM ll_users WHERE id = $1',
      [userId]
    );
    if (!rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

export { auth };
