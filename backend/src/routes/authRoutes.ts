// backend/src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('AuthRoutes');

// Route to initiate the GitHub OAuth flow
router.get('/github', (req: Request, res: Response) => {
  logger.info('Initiating GitHub OAuth flow');
  authController.initiateOAuth(req, res);
});

// Route to handle the OAuth callback from GitHub
router.get('/github/callback', async (req: Request, res: Response) => {
  logger.info('Received GitHub OAuth callback');
  await authController.handleOAuthCallback(req, res);
});

// Route to get the current authenticated user (protected)
router.get('/me', authenticate, (req: Request, res: Response) => {
  logger.info('Get current user', { userId: req.user?.userId });
  authController.getCurrentUser(req, res);
});

// Route to validate a GitHub personal access token
router.post('/validate-github-token', (req: Request, res: Response) => {
  logger.info('Validating GitHub token');
  authController.validateGitHubToken(req, res);
});

export default router;