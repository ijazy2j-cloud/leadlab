import { z } from 'zod';
import * as medicalService from '../services/medicalService.js';
import { createFromSource } from '../services/followUpService.js';

const medicalSchema = z.object({
  title: z.string().min(3),
  symptoms: z.string().min(10),
  diagnosis: z.string().min(10),
  treatment: z.string().min(10),
  followUp: z.string().optional().default(''),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

const medicalPatchSchema = z.object({
  title: z.string().min(3).optional(),
  symptoms: z.string().min(10).optional(),
  diagnosis: z.string().min(10).optional(),
  treatment: z.string().min(10).optional(),
  followUp: z.string().optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export { medicalSchema, medicalPatchSchema };

async function list(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const rows = await medicalService.list(req.user.id, page);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const record = await medicalService.get(parseInt(req.params.id, 10), req.user.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const record = await medicalService.create(req.user.id, req.body);
    if (req.body.followUpDate) {
      await createFromSource('MEDICAL', record.id, req.user.id, req.body.title, req.body.followUpDate);
    }
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const record = await medicalService.update(parseInt(req.params.id, 10), req.user.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await medicalService.remove(parseInt(req.params.id, 10), req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export { list, get, create, update, remove };
