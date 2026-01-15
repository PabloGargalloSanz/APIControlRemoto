import {Router} from 'express';

import { register, loggin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/loggin', loggin);

export default router;