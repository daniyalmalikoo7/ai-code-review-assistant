import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { createLogger } from '../utils/logger';

const logger = createLogger('GitHubWebhookValidator');

/**
 * Validates that the webhook request is authentic and from GitHub
 * Uses the webhook secret to validate the signature
 */
export function validateGitHubWebhook(req: Request, res: Response, next: NextFunction): void {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;
    const deliveryId = req.headers['x-github-delivery'] as string;
    
    // Check if all necessary headers are present
    if (!signature || !event || !deliveryId) {
      logger.warn('Missing required GitHub webhook headers', {
        signature: !!signature,
        event: !!event,
        deliveryId: !!deliveryId
      });
      res.status(400).json({ error: 'Missing required GitHub webhook headers' });
      return;
    }
    
    // Skip signature validation if in development mode with the bypass flag
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_WEBHOOK_VALIDATION === 'true') {
      logger.warn('Bypassing webhook signature validation in development mode');
      next();
      return;
    }
    
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('GITHUB_WEBHOOK_SECRET environment variable is not set');
      res.status(500).json({ error: 'Server is not configured to validate webhooks' });
      return;
    }

    // Get raw request body for signature validation
    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    
    // Check if calculated signature matches the one from GitHub
    // Fix: Use a safer comparison that won't throw errors
    const signatureBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);
    
    let signaturesMatch = false;
    
    // Only compare if the buffers are the same length
    if (signatureBuffer.length === digestBuffer.length) {
      signaturesMatch = crypto.timingSafeEqual(digestBuffer, signatureBuffer);
    }
    
    if (!signaturesMatch) {
      logger.warn('Invalid webhook signature', { deliveryId, event });
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    
    logger.info('GitHub webhook signature validated successfully', { event, deliveryId });
    next();
  } catch (error) {
    logger.error('Error validating GitHub webhook', { error });
    // Even on error, we should return 401 for invalid signatures
    res.status(401).json({ error: 'Invalid signature' });
  }
}