import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as controller from '../controllers/followUpController.js';

const router = Router();

router.get('/', auth, controller.list);
router.post('/', auth, validate(controller.createSchema), controller.create);
router.patch('/:id', auth, validate(controller.patchSchema), controller.update);
router.delete('/:id', auth, controller.remove);

export default router;
