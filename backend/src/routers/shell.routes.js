import {Router} from 'express';
import { executeComand } from '../controllers/shell.controller.js';
import {verifyToken} from '../middlewares/jwt.middleware.js';

const router = Router();

router.post('/execute', verifyToken, executeComand);
export default router;