import { prisma } from '../lib/prisma.js';

// TODO: replace with HSBC SSO middleware later.
// This is the only place that identifies a user — swap the body of this function
// when SSO is ready; all routes stay unchanged.
async function auth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Missing x-user-id header' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  next();
}

export { auth };
