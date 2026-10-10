import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { signupSchema, signinSchema } from '../middleware/schemas.js';
import { requireAuth } from '../middleware/auth.js';
import { signup, signin, me } from '../controllers/authController.js';

const router = Router();

router.post('/signup', authLimiter, validateBody(signupSchema), signup);
router.post('/signin', authLimiter, validateBody(signinSchema), signin);
router.get('/me', requireAuth, me);

export default router;
