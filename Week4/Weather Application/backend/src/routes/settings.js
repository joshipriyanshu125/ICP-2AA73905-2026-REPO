import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { settingsSchema } from '../middleware/schemas.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();

/* Per-user severe-weather alert preferences (row-level scoped by user id) */
router.get('/', requireAuth, getSettings);
router.put('/', requireAuth, validateBody(settingsSchema), updateSettings);

export default router;
