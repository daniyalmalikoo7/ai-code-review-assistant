import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import webhookRoutes from '../../src/routes/webhookRoutes';
import { errorHandler } from '../../src/middleware/error';

// Mock environment variables
process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.BYPASS_WEBHOOK_VALIDATION = 'false';
process.env.GITHUB_TOKEN = 'test-github-token';

// Mock fetch to avoid actual API calls
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('')
  })
) as jest.Mock;

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

jest.mock('../../src/utils/codeAnalyzer', () => ({
  analyzePullRequest: jest.fn().mockImplementation((payload) => ({
    prId: payload.id,
    issues: [
      {
        id: 'test-issue-1',
        title: 'Security Issue',
        description: 'Test security issue',
        severity: 'Critical',
        category: 'Security',
        location: { file: 'src/app.js', line: 10 }
      }
    ],
    summary: {
      totalIssues: 1,
      criticalCount: 1,
      warningCount: 0,
      suggestionCount: 0,
      issuesByCategory: {
        Security: 1,
        Performance: 0,
        CodeStyle: 0,
        Maintainability: 0,
        Architecture: 0
      }
    },
    metadata: {
      analyzedAt: new Date().toISOString(),
      duration: 100
    }
  })),
  PullRequestPayload: jest.fn()
}));

jest.mock('../../src/utils/feedbackGenerator', () => ({
  generateFeedback: jest.fn().mockImplementation((analysis) => ({
    inlineComments: [
      {
        file: 'src/app.js',
        line: 10,
        message: 'Test comment',
        severity: 'Critical',
        category: 'Security',
        suggestionId: 'test-issue-1'
      }
    ],
    summaryReport: {
      prId: analysis.prId,
      title: 'Test Review',
      overallScore: 80,
      issueStats: {
        total: 1,
        critical: 1,
        warning: 0,
        suggestion: 0
      },
      topIssues: [],
      fileReports: [],
      analysisTime: new Date().toISOString(),
      duration: 100
    },
    markdownSummary: '# Test Review\n\nFound 1 issue'
  }))
}));

jest.mock('../../src/services/githubService', () => ({
  submitFeedbackToGitHub: jest.fn().mockResolvedValue(undefined),
  fetchPRFiles: jest.fn().mockResolvedValue([
    {
      filename: 'src/app.js',
      status: 'modified',
      contents_url: 'https://api.github.com/repos/owner/repo/contents/src/app.js'
    }
  ]),
  fetchFileContent: jest.fn().mockResolvedValue('function test() { console.log("test"); }')
}));

describe('GitHub Webhook Endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/webhooks', webhookRoutes);
    app.use(errorHandler);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  function generateSignature(payload: any): string {
    const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(JSON.stringify(payload)).digest('hex');
    return `sha256=${signature}`;
  }

  it('should return 400 if GitHub event header is missing', async () => {
    const response = await request(app)
      .post('/api/webhooks/github')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required GitHub webhook headers');
  });

  it('should process a valid pull request opened event', async () => {
    const payload = {
      action: 'opened',
      pull_request: {
        number: 123,
        title: 'Test PR',
        body: 'This is a test PR',
        head: { ref: 'feature-branch' },
        base: { ref: 'main' },
        user: { login: 'test-user' },
        url: 'https://api.github.com/repos/owner/repo/pulls/123'
      },
      repository: {
        full_name: 'owner/repo'
      }
    };

    const signature = generateSignature(payload);

    const response = await request(app)
      .post('/api/webhooks/github')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-GitHub-Delivery', '123456')
      .set('X-Hub-Signature-256', signature)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.prId).toBe(123);
    expect(response.body.repository).toBe('owner/repo');
  });

  it('should ignore pull request events with irrelevant actions', async () => {
    const payload = {
      action: 'labeled',  // Not one of 'opened', 'synchronize', 'reopened'
      pull_request: {
        number: 123,
        title: 'Test PR',
        head: { ref: 'feature-branch' },
        base: { ref: 'main' },
        user: { login: 'test-user' }
      },
      repository: {
        full_name: 'owner/repo'
      }
    };

    const signature = generateSignature(payload);

    const response = await request(app)
      .post('/api/webhooks/github')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-GitHub-Delivery', '123456')
      .set('X-Hub-Signature-256', signature)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ignored');
    expect(response.body.action).toBe('labeled');
  });

  it('should ignore non-pull_request events', async () => {
    const payload = {
      action: 'created',
      issue: {
        number: 123,
        title: 'Test Issue'
      },
      repository: {
        full_name: 'owner/repo'
      }
    };

    const signature = generateSignature(payload);

    const response = await request(app)
      .post('/api/webhooks/github')
      .set('X-GitHub-Event', 'issues')  // Not 'pull_request'
      .set('X-GitHub-Delivery', '123456')
      .set('X-Hub-Signature-256', signature)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ignored');
    expect(response.body.event).toBe('issues');
  });

  // Test case specifically for testing webhook validation
  it('should reject requests with invalid signatures', async () => {
    const payload = {
      action: 'opened',
      pull_request: {
        number: 123,
        title: 'Test PR',
        head: { ref: 'feature-branch' },
        base: { ref: 'main' },
        user: { login: 'test-user' }
      },
      repository: {
        full_name: 'owner/repo'
      }
    };

    // Use an invalid secret to generate the signature
    const invalidSignature = 'sha256=invalid-signature';

    const response = await request(app)
      .post('/api/webhooks/github')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-GitHub-Delivery', '123456')
      .set('X-Hub-Signature-256', invalidSignature)
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Invalid signature');
  });

  // Test for development bypass mode
  it('should bypass signature validation in development mode with bypass flag', async () => {
    // Set environment variables for this test
    const originalEnv = process.env;
    process.env.NODE_ENV = 'development';
    process.env.BYPASS_WEBHOOK_VALIDATION = 'true';

    const payload = {
      action: 'opened',
      pull_request: {
        number: 123,
        title: 'Test PR',
        body: 'This is a test PR',
        head: { ref: 'feature-branch' },
        base: { ref: 'main' },
        user: { login: 'test-user' },
        url: 'https://api.github.com/repos/owner/repo/pulls/123'
      },
      repository: {
        full_name: 'owner/repo'
      }
    };

    // Invalid signature should pass with bypass flag
    const invalidSignature = 'sha256=invalid-signature';

    const response = await request(app)
      .post('/api/webhooks/github')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-GitHub-Delivery', '123456')
      .set('X-Hub-Signature-256', invalidSignature)
      .send(payload);

    // Should succeed despite invalid signature
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');

    // Reset the environment variables
    process.env = originalEnv;
  });
});