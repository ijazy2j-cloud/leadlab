import * as userService from '../services/userService.js';

async function list(req, res, next) {
  try {
    const rows = await userService.listAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json(req.user);
}

export { list, me };
