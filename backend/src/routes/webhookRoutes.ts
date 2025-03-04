// backend/src/routes/webhookRoutes.ts
import { Router } from 'express';
import { handlePullRequestWebhook } from '../controllers/githubWebhookController';
import { createLogger } from '../utils/logger';
import { authenticateWebhook } from '../middleware/auth.middleware';

const router = Router();
const logger = createLogger('WebhookRoutes');

// GitHub webhook endpoint for PR events
router.post('/github', authenticateWebhook, async (req, res) => {
  logger.info('Received GitHub webhook');
  await handlePullRequestWebhook(req, res);
});

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