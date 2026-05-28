import * as dashboardService from '../services/dashboardService.js';

async function stats(req, res, next) {
  try {
    const data = await dashboardService.getStats(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export { stats };
