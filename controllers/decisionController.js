import { z } from 'zod';
import * as decisionService from '../services/decisionService.js';
import { createFromSource } from '../services/followUpService.js';

const decisionSchema = z.object({
  decision: z.string().min(10),
  q1Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q1Why: z.string().optional().default(''),
  q2Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q2Why: z.string().optional().default(''),
  q3Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q3Why: z.string().optional().default(''),
  q4Answer: z.enum(['YES', 'NO', 'UNSURE']),
  q4Why: z.string().optional().default(''),
  outcome: z.enum(['PROCEED', 'PAUSE', 'AMEND', 'STOP']),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
  followUpNote: z.string().optional().default(''),
});

const decisionPatchSchema = z.object({
  decision: z.string().min(10).optional(),
  q1Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q1Why: z.string().optional(),
  q2Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q2Why: z.string().optional(),
  q3Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q3Why: z.string().optional(),
  q4Answer: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  q4Why: z.string().optional(),
  outcome: z.enum(['PROCEED', 'PAUSE', 'AMEND', 'STOP']).optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
  followUpNote: z.string().optional(),
});

export { decisionSchema, decisionPatchSchema };

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const rows = await decisionService.list(req.user.id, page);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const record = await decisionService.get(parseInt(req.params.id, 10), req.user.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const record = await decisionService.create(req.user.id, req.body);
    if (req.body.followUpDate) {
      await createFromSource('DECISION', record.id, req.user.id, req.body.decision, req.body.followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const record = await decisionService.update(parseInt(req.params.id, 10), req.user.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await decisionService.remove(parseInt(req.params.id, 10), req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
