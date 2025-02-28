import { Router } from 'express';
import { handlePullRequestWebhook } from '../controllers/githubWebhookController';
import { createLogger } from '../utils/logger';
import { validateGitHubWebhook } from '../middleware/githubWebhookValidator';

const router = Router();
const logger = createLogger('WebhookRoutes');

// GitHub webhook endpoint for PR events
// The validateGitHubWebhook middleware authenticates the webhook
router.post('/github', validateGitHubWebhook, async (req, res) => {
  logger.info('Received GitHub webhook');
  await handlePullRequestWebhook(req, res);
});

export default router;