import * as principleService from '../services/principleService.js';

async function list(req, res, next) {
  try {
    const rows = await principleService.list();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const record = await principleService.get(parseInt(req.params.id, 10));
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

export { list, get };
