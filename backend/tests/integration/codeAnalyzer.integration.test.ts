import request from 'supertest';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

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

// Now import after mocks are set up
import * as codeAnalyzer from '../../src/utils/codeAnalyzer';
import * as feedbackGenerator from '../../src/utils/feedbackGenerator';
import app from '../../src/app';

// Sample data for testing
const samplePRWithCodeContent = {
  id: 123,
  title: "Add user authentication feature",
  description: "This PR adds user authentication functionality",
  branch: "feature/auth",
  base: "main",
  repository: "owner/repo",
  author: "testuser",
  changes: [
    {
      filename: "src/auth/login.ts",
      status: "added",
      content: `
        function login(username, password) {
          // Security issue: SQL injection vulnerability
          const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
          
          // Security issue: Hardcoded credentials
          const apiKey = "1234567890abcdef";
          
          // Performance issue: Nested loops
          for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < permissions.length; j++) {
              console.log(users[i], permissions[j]);
            }
          }
          
          return { authenticated: true };
        }
      `
    },
    {
      filename: "src/controllers/userController.ts",
      status: "modified",
      content: `
        // Architectural issue: Controller with data access
        export class UserController {
          getUser(req, res) {
            // Direct data access in controller
            const user = new User();
            const result = user.findOne({ id: req.params.id });
            res.json(result);
          }
        }
      `
    }
  ]
};

describe('End-to-End Code Analyzer API Integration', () => {
  let server: Server;
  let validToken: string;
  
  // Mock environment variables
  const originalEnv = process.env;
  
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.NODE_ENV = 'test';
    
    server = app.listen(0); // Use any available port
    
    // Create a valid JWT token for testing
    validToken = jwt.sign({
      userId: 123,
      username: 'testuser',
      email: 'test@example.com'
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
            file: 'src/auth/login.ts',
            line: 7
          },
          snippet: 'const apiKey = "1234567890abcdef";',
          remediation: 'Use environment variables instead'
        },
        {
          id: 'test-issue-2',
          title: 'SQL Injection',
          description: 'Potential SQL injection vulnerability',
          category: codeAnalyzer.IssueCategory.Security,
          severity: codeAnalyzer.IssueSeverity.Critical,
          location: {
            file: 'src/auth/login.ts',
            line: 4
          },
          snippet: 'const query = "SELECT * FROM users WHERE username = \'" + username + "\'";',
          remediation: 'Use parameterized queries'
        }
      ],
      summary: {
        totalIssues: 2,
        criticalCount: 2,
        warningCount: 0,
        suggestionCount: 0,
        issuesByCategory: {
          [codeAnalyzer.IssueCategory.Security]: 2,
          [codeAnalyzer.IssueCategory.Performance]: 0,
          [codeAnalyzer.IssueCategory.CodeStyle]: 0,
          [codeAnalyzer.IssueCategory.Maintainability]: 0,
          [codeAnalyzer.IssueCategory.Architecture]: 0
        }
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        duration: 150
      }
    });
    
    // Setup feedbackGenerator mock
    (feedbackGenerator.generateFeedback as jest.Mock).mockReturnValue({
      inlineComments: [
        {
          file: 'src/auth/login.ts',
          line: 7,
          message: '🚨 **Critical: Hardcoded API Key**\n\nFound potential hardcoded secret in the code',
          severity: codeAnalyzer.IssueSeverity.Critical,
          category: codeAnalyzer.IssueCategory.Security,
          suggestionId: 'test-issue-1'
        },
        {
          file: 'src/auth/login.ts',
          line: 4,
          message: '🚨 **Critical: SQL Injection**\n\nPotential SQL injection vulnerability',
          severity: codeAnalyzer.IssueSeverity.Critical,
          category: codeAnalyzer.IssueCategory.Security,
          suggestionId: 'test-issue-2'
        }
      ],
      summaryReport: {
        prId: 123,
        title: 'AI Code Review',
        overallScore: 70,
        issueStats: {
          critical: 2,
          warning: 0,
          suggestion: 0,
          total: 2
        },
        topIssues: [
          {
            severity: codeAnalyzer.IssueSeverity.Critical,
            category: codeAnalyzer.IssueCategory.Security,
            title: 'Hardcoded API Key',
            file: 'src/auth/login.ts',
            line: 7
          },
          {
            severity: codeAnalyzer.IssueSeverity.Critical,
            category: codeAnalyzer.IssueCategory.Security,
            title: 'SQL Injection',
            file: 'src/auth/login.ts',
            line: 4
          }
        ],
        fileReports: [],
        analysisTime: new Date().toISOString(),
        duration: 150
      },
      markdownSummary: '# AI Code Review\n\nFound 2 critical security issues.'
    });
  });
  
  test('should analyze PR with feedback via API endpoint', async () => {
    const response = await request(app)
      .post('/api/code-analyzer/analyze-pr-with-feedback')
      .set('Authorization', `Bearer ${validToken}`)
      .send(samplePRWithCodeContent);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('analysis');
    expect(response.body).toHaveProperty('feedback');
    
    // Verify analysis structure
    expect(response.body.analysis).toEqual(expect.objectContaining({
      prId: expect.any(Number),
      issues: expect.any(Array),
      summary: expect.objectContaining({
        totalIssues: expect.any(Number),
        criticalCount: expect.any(Number)
      })
    }));
    
    // Verify feedback structure
    expect(response.body.feedback).toEqual(expect.objectContaining({
      inlineComments: expect.any(Array),
      summaryReport: expect.objectContaining({
        prId: expect.any(Number),
        overallScore: expect.any(Number),
        issueStats: expect.objectContaining({
          critical: expect.any(Number),
          total: expect.any(Number)
        })
      }),
      markdownSummary: expect.any(String)
    }));
    
    // Verify that services were called with the right parameters
    expect(codeAnalyzer.analyzePullRequest).toHaveBeenCalledTimes(1);
    expect(codeAnalyzer.analyzePullRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        changes: expect.any(Array)
      })
    );
    
    expect(feedbackGenerator.generateFeedback).toHaveBeenCalledTimes(1);
    expect(feedbackGenerator.generateFeedback).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining('Code Review for PR')
    );
  });
});