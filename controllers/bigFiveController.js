import { z } from 'zod';
import * as bigFiveService from '../services/bigFiveService.js';
import { createFromSource } from '../services/followUpService.js';

const bigFiveSchema = z.object({
  topic: z.string().min(3),
  priorities: z.string().min(1),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const bigFivePatchSchema = z.object({
  topic: z.string().min(3).optional(),
  priorities: z.string().optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export { bigFiveSchema, bigFivePatchSchema };

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const rows = await bigFiveService.list(req.user.id, page);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const record = await bigFiveService.get(parseInt(req.params.id, 10), req.user.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const record = await bigFiveService.create(req.user.id, req.body);
    if (req.body.followUpDate) {
      await createFromSource('BIG_FIVE', record.id, req.user.id, `Review: ${req.body.topic}`, req.body.followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const record = await bigFiveService.update(parseInt(req.params.id, 10), req.user.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await bigFiveService.remove(parseInt(req.params.id, 10), req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
