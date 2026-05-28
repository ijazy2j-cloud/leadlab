import * as activityService from '../services/activityService.js';

async function list(req, res, next) {
  try {
    const principleId = req.query.principleId
      ? parseInt(req.query.principleId, 10)
      : undefined;
    const rows = await activityService.list(principleId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export { list };
