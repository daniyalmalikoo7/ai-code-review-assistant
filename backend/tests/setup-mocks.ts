/**
 * Global test setup and mocks for integration tests
 * This file is loaded before tests run to set up mocks and environment variables
 */

// Import the middlewares - necessary for proper TypeScript mocking
import { authenticate as originalAuth } from '../src/middleware/auth.middleware';
import { validateGitHubWebhook as originalValidator } from '../src/middleware/githubWebhookValidator';
import { Request, Response, NextFunction } from 'express';

// Mock authentication middleware
jest.mock('../src/middleware/auth.middleware', () => ({
  authenticate: require('./mocks/authMock').authenticate,
  // Add a mock for authenticateWebhook that properly handles the 'invalid' signature
  authenticateWebhook: jest.fn((req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    if (signature && signature.includes('invalid')) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    next();
  })
}));

// Mock GitHub webhook validator
jest.mock('../src/middleware/githubWebhookValidator', () => ({
  validateGitHubWebhook: jest.fn((req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    if (signature && signature.includes('invalid')) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    next();
  })
}));

// Set test environment variables
process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.ANTHROPIC_API_KEY = 'sk-ant-api03-dummy-key-for-testing';
process.env.SUBMIT_FEEDBACK_TO_GITHUB = 'false';
process.env.BYPASS_WEBHOOK_VALIDATION = 'false';

// Mock GitHub service
jest.mock('../src/services/githubService', () => ({
  submitFeedbackToGitHub: jest.fn().mockResolvedValue(undefined),
  fetchPRFiles: jest.fn().mockResolvedValue([
    {
      filename: 'src/app.js',
      status: 'modified',
      contents_url: 'https://api.github.com/repos/owner/repo/contents/src/app.js'
    }
  ]),
  fetchFileContent: jest.fn().mockResolvedValue('const x = 1;')
}));

// Mock LLM service for tests that don't specifically test it
jest.mock('../src/services/llmService', () => ({
  analyzeCode: jest.fn().mockResolvedValue('Test code analysis response'),
  sendPrompt: jest.fn().mockResolvedValue('Test prompt response'),
  executePromptChain: jest.fn().mockResolvedValue('Test prompt chain response')
}));

// Mock node-fetch
jest.mock('node-fetch', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({}),
      text: jest.fn().mockResolvedValue(''),
      headers: new Map()
    })
  };
});