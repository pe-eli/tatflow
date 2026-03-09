import { Router } from 'express';
import { register, login, me, checkSlug, updateSlug, updateWhatsappMessage, updateStudioName } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.get('/check-slug/:slug', checkSlug);
router.patch('/slug', authenticate, updateSlug);
router.patch('/whatsapp-message', authenticate, updateWhatsappMessage);
router.patch('/studio-name', authenticate, updateStudioName);

export default router;
