import {Router} from 'express';

import { register, login } from '../controllers/auth.controller.js';
import { guardIpBlocked } from '../middlewares/ipGuard.middleware.js';

const router = Router();

//router.post('/register', register);
router.post('/login',guardIpBlocked, login);

export default router;