import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as controller from '../controllers/userController.js';

const router = Router();

// No auth — powers the mock login user picker
router.get('/', controller.list);
router.get('/me', auth, controller.me);

export default router;
