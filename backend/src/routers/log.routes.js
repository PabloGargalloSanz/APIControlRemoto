import {Router} from 'express';

import { getLogError } from '../controllers/log.controller.js';

const router = Router();

router.get('/error', getLogError);


export default router;