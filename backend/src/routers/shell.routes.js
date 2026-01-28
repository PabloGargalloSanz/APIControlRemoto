import {Router} from 'express';
import { executeComand } from '../controllers/shell.controller.js';

const router = Router();

router.post('/execute', executeComand);
export default router;