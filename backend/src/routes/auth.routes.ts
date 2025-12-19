import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/registro', AuthController.registrar);
router.get('/perfil', authenticate, AuthController.perfil);

export default router;








