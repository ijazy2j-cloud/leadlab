import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as controller from '../controllers/dashboardController.js';

const router = Router();

router.get('/', auth, controller.stats);

export default router;
