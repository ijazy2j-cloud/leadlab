import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as controller from '../controllers/principleController.js';

const router = Router();

router.get('/', auth, controller.list);
router.get('/:id', auth, controller.get);

export default router;
