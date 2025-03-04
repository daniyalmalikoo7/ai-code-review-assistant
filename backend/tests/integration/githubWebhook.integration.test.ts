import request from 'supertest';
import crypto from 'crypto';
import { Server } from 'http';
import * as codeAnalyzer from '../../src/utils/codeAnalyzer';
import * as feedbackGenerator from '../../src/utils/feedbackGenerator';

// Mock dependencies before importing app
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { userId: 123, username: 'testuser', email: 'test@example.com' };
    next();
  }),
  authenticateWebhook: jest.fn((req, res, next) => next())
}));

jest.mock('../../src/utils/codeAnalyzer');
jest.mock('../../src/utils/feedbackGenerator');
jest.mock('../../src/services/githubService', () => ({
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

// Now import app after mocks are set up
import app from '../../src/app';

// Sample PR payload for testing
const samplePRPayload = {
  action: 'opened',
  pull_request: {
    number: 123,
    title: 'Add user authentication feature',
    body: 'This PR adds the user authentication feature with login and registration.',
    head: { ref: 'feature/auth' },
    base: { ref: 'main' },
    user: { login: 'testuser' },
    url: 'https://api.github.com/repos/owner/repo/pulls/123'
  },
  repository: {
    full_name: 'owner/repo'
  }
};

describe('End-to-End GitHub Webhook Integration', () => {
  let server: Server;
  const WEBHOOK_SECRET = 'test-webhook-secret';
  
  // Mock environment variables
  const originalEnv = process.env;
  
  beforeAll(() => {
    process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.NODE_ENV = 'test';
    process.env.SUBMIT_FEEDBACK_TO_GITHUB = 'true';
    
    server = app.listen(0); // Use any available port
  });
  
  afterAll((done) => {
    process.env = originalEnv;
    server.close(done);
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup codeAnalyzer mock
    (codeAnalyzer.analyzePullRequest as jest.Mock).mockReturnValue({
      prId: 123,
      issues: [
        {
          id: 'test-issue-1',
          title: 'Hardcoded API Key',
          description: 'Found potential hardcoded secret in the code',
          category: codeAnalyzer.IssueCategory.Security,
          severity: codeAnalyzer.IssueSeverity.Critical,
          location: {
            file: 'src/app.js',
            line: 7
          },
          snippet: 'const apiKey = "1234567890abcdef";',
          remediation: 'Use environment variables instead'
        }
      ],
      summary: {
        totalIssues: 1,
        criticalCount: 1,
        warningCount: 0,
        suggestionCount: 0,
        issuesByCategory: {
          [codeAnalyzer.IssueCategory.Security]: 1,
          [codeAnalyzer.IssueCategory.Performance]: 0,
          [codeAnalyzer.IssueCategory.CodeStyle]: 0,
          [codeAnalyzer.IssueCategory.Maintainability]: 0,
          [codeAnalyzer.IssueCategory.Architecture]: 0
        }
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        duration: 100
      }
    });
    
    // Setup feedbackGenerator mock
    (feedbackGenerator.generateFeedback as jest.Mock).mockReturnValue({
      inlineComments: [
        {
          file: 'src/app.js',
          line: 7,
          message: '🚨 **Critical: Hardcoded API Key**\n\nFound potential hardcoded secret in the code',
          severity: codeAnalyzer.IssueSeverity.Critical,
          category: codeAnalyzer.IssueCategory.Security,
          suggestionId: 'test-issue-1'
        }
      ],
      summaryReport: {
        prId: 123,
        title: 'AI Code Review',
        overallScore: 80,
        issueStats: {
          critical: 1,
          warning: 0,
          suggestion: 0,
          total: 1
        },
        topIssues: [],
        fileReports: [],
        analysisTime: new Date().toISOString(),
        duration: 100
      },
      markdownSummary: '# AI Code Review\n\nFound 1 critical issue.'
    });
  });
  
  function generateSignature(payload: any): string {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const signature = hmac.update(JSON.stringify(payload)).digest('hex');
    return `sha256=${signature}`;
  }
  
  test('should process a pull request webhook event end-to-end', async () => {
    const signature = generateSignature(samplePRPayload);
    
    const response = await request(app)
      .post('/api/webhooks/github')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-GitHub-Delivery', '123456')
      .set('X-Hub-Signature-256', signature)
      .send(samplePRPayload);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      status: 'success',
      prId: expect.any(Number)
    }));
    
    // Verify that code analyzer was called with correct data
    expect(codeAnalyzer.analyzePullRequest).toHaveBeenCalledTimes(1);
    expect(codeAnalyzer.analyzePullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        branch: expect.any(String),
        changes: expect.any(Array)
      })
    );
    
    // Verify that feedback generator was called with the analysis result
    expect(feedbackGenerator.generateFeedback).toHaveBeenCalledTimes(1);
    expect(feedbackGenerator.generateFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        prId: expect.any(Number),
        issues: expect.any(Array),
        summary: expect.any(Object)
      }),
      expect.any(String)
    );
    
    // Verify that submitting feedback to GitHub is attempted
    const { submitFeedbackToGitHub } = require('../../src/services/githubService');
    expect(submitFeedbackToGitHub).toHaveBeenCalledTimes(1);
    expect(submitFeedbackToGitHub).toHaveBeenCalledWith(
      expect.any(String),  // repositoryFullName
      expect.any(Number),  // prNumber
      expect.objectContaining({
        inlineComments: expect.any(Array),
        summaryReport: expect.any(Object),
        markdownSummary: expect.any(String)
      }),
      expect.any(String)  // token parameter
    );
  });
});