import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as controller from '../controllers/bigFiveController.js';

const router = Router();

router.get('/', auth, controller.list);
router.get('/:id', auth, controller.get);
router.post('/', auth, validate(controller.bigFiveSchema), controller.create);
router.patch('/:id', auth, validate(controller.bigFivePatchSchema), controller.update);
router.delete('/:id', auth, controller.remove);

export default router;
