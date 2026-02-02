import {Router} from 'express';
import { executeComand, getLogShell } from '../controllers/shell.controller.js';
import {verifyToken} from '../middlewares/jwt.middleware.js';

const router = Router();

router.post('/execute', verifyToken, executeComand);
router.get('/execute', getLogShell);
export default router;