// backend/src/routes/settingsRoutes.ts
import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authenticate } from '../middleware/auth.middleware';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('SettingsRoutes');

// All routes in this file require authentication
router.use(authenticate);

// Get user settings
router.get('/', (req, res) => {
  logger.info('Get user settings', { userId: req.user?.userId });
  settingsController.getUserSettings(req, res);
});

// Update user settings
router.post('/', (req, res) => {
  logger.info('Update user settings', { userId: req.user?.userId });
  settingsController.updateUserSettings(req, res);
});

// Delete user settings
router.delete('/', (req, res) => {
  logger.info('Delete user settings', { userId: req.user?.userId });
  settingsController.deleteUserSettings(req, res);
});

export default router;