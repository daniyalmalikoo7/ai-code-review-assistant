// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthController');

/**
 * Initialize OAuth flow by redirecting to GitHub
 */
export const initiateOAuth = (req: Request, res: Response): void => {
  try {
    const authUrl = authService.getAuthorizationUrl();
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error initiating OAuth flow', { error });
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
};

/**
 * Handle OAuth callback from GitHub
 */
export const handleOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      logger.warn('Missing authorization code');
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }
    
    // Exchange the code for an access token
    const accessToken = await authService.exchangeCodeForToken(code);
    
    // Get user information
    const githubUser = await authService.getGitHubUser(accessToken);
    
    // Generate a JWT token
    const token = authService.generateToken(githubUser);
    
    // In a real application, you might:
    // 1. Store the user in your database
    // 2. Store the GitHub access token securely
    // 3. Set up refresh token logic
    
    // For this example, we'll just redirect to a frontend page with the token as a query parameter
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${redirectUrl}/auth/callback?token=${token}`);
  } catch (error) {
    logger.error('Error handling OAuth callback', { error });
    const errorPage = process.env.ERROR_REDIRECT_URL || 'http://localhost:3000/auth/error';
    res.redirect(`${errorPage}?error=oauth_failed`);
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (req: Request, res: Response): Response => {
  // The user object is added by the authenticate middleware
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  return res.status(200).json({ user: req.user });
};

/**
 * Validate a GitHub personal access token
 */
export const validateGitHubToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const result = await authService.validateGitHubToken(token);
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error validating GitHub token', { error });
    return res.status(500).json({ error: 'Failed to validate token' });
  }
};