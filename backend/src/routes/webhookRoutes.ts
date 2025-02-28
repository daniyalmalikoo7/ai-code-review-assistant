// backend/src/routes/webhookRoutes.ts
import { Router } from 'express';
import githubWebhookRoutes from './githubWebhookRoutes';
import { createLogger } from '../utils/logger';
import { authenticateWebhook } from '../middleware/auth.middleware';

const router = Router();
const logger = createLogger('WebhookRoutes');

// Mount GitHub webhook routes with webhook authentication middleware
router.use('/github', authenticateWebhook, githubWebhookRoutes);

// Info endpoint to check webhook configuration (not protected)
router.get('/info', (req, res) => {
  logger.info('Webhook info endpoint accessed');
  res.json({
    status: 'active',
    supported: ['github'],
    timestamp: new Date().toISOString()
  });
});

export default router;