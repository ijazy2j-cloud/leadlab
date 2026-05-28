import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as controller from '../controllers/activityController.js';

const router = Router();

router.get('/', auth, controller.list);

export default router;
