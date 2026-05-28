import { z } from 'zod';
import * as followUpService from '../services/followUpService.js';

const createSchema = z.object({
  commitment: z.string().min(3),
  dueDate: z.string().datetime(),
  owner: z.string().optional().default('me'),
  sourceType: z.enum(['DECISION', 'MEDICAL', 'BIG_FIVE', 'COACHING', 'MANUAL']).default('MANUAL'),
  sourceId: z.number().int().optional(),
});

const patchSchema = z.object({
  status: z.enum(['OPEN', 'DONE', 'CANCELLED']).optional(),
  outcome: z.string().optional(),
  commitment: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  owner: z.string().optional(),
});

export { createSchema, patchSchema };

async function list(req, res, next) {
  try {
    const rows = await followUpService.list(req.user.id, req.query.status);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const record = await followUpService.create(req.user.id, req.body);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const record = await followUpService.update(parseInt(req.params.id, 10), req.user.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await followUpService.remove(parseInt(req.params.id, 10), req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export { list, create, update, remove };
