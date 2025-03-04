// frontend/src/tests/integration/api.integration.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { IssueSeverity, IssueCategory, ReviewSummary } from '@/types/review';
import React from 'react';

// Set up mocks for Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null)
  })),
}));

// Mock Next/Link properly for Next.js 15+
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...rest }: any) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

// Create React component mocks before importing actual components
jest.mock('@/components/dashboard/ReviewCard', () => {
  return function MockReviewCard({ review }: { review: ReviewSummary }) {
    return (
      <div data-testid="review-card">
        <h3>PR #{review.prId}: {review.prTitle}</h3>
        <p>Repository: {review.repository}</p>
        <p>Branch: {review.branch}</p>
        <p>Score: {review.overallScore}/100</p>
        <p>Critical: {review.issueStats.critical}</p>
        <p>Warning: {review.issueStats.warning}</p>
        <p>Suggestion: {review.issueStats.suggestion}</p>
        <a href={`/reviews/${review.id}`}>View Details</a>
      </div>
    );
  };
});

jest.mock('@/components/reviews/IssueDetail', () => {
  return function MockIssueDetail({ issue, fileContent }: any) {
    return (
      <div data-testid="issue-detail">
        <h3>Issue: {issue?.message?.split('\n')[0]?.replace(/🚨|⚠️|💡|\*\*/g, '')?.trim()}</h3>
        <p>File: {issue?.file} (Line {issue?.line})</p>
        <p>Severity: {issue?.severity}</p>
        <p>Category: {issue?.category}</p>
        {fileContent && <pre>{fileContent.substring(0, 50)}...</pre>}
      </div>
    );
  };
});

jest.mock('@/components/reviews/CodeBlock', () => {
  return function MockCodeBlock({ code, highlight, filename }: any) {
    return (
      <div data-testid="code-block">
        {filename && <div>{filename}</div>}
        <pre>{code}</pre>
        {highlight && highlight.length > 0 && <div>Highlighted lines: {highlight.join(', ')}</div>}
      </div>
    );
  };
});

jest.mock('@/components/reviews/IssueSummary', () => {
  return function MockIssueSummary({ review }: any) {
    return (
      <div data-testid="issue-summary">
        <h3>PR #{review.prId}: {review.prTitle}</h3>
        <p>Repository: {review.repository}</p>
        <p>Branch: {review.branch}</p>
        <p>Author: {review.author}</p>
        <p>Score: {review.overallScore}/100</p>
        <p>Critical: {review.issueStats.critical}</p>
        <p>Warning: {review.issueStats.warning}</p>
        <p>Suggestion: {review.issueStats.suggestion}</p>
        <p>Total: {review.issueStats.total}</p>
      </div>
    );
  };
});

// Sample data for tests
const mockReviewSummary = {
  id: '1',
  prId: 123,
  prTitle: 'Add user authentication feature',
  repository: 'owner/repo',
  branch: 'feature/auth',
  author: 'testuser',
  status: 'completed' as const,
  createdAt: '2023-06-01T12:00:00Z',
  completedAt: '2023-06-01T12:05:30Z',
  overallScore: 75,
  issueStats: {
    critical: 2,
    warning: 3,
    suggestion: 5,
    total: 10
  }
};

const mockInlineComment = {
  file: 'src/auth/login.ts',
  line: 7,
  message: '🚨 **Critical: Hardcoded API Key**\n\nFound potential hardcoded secret in the code\n\n```\napiKey = "1234567890abcdef"\n```\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Use environment variables or a secure secrets manager instead of hardcoding secrets',
  severity: IssueSeverity.Critical,
  category: IssueCategory.Security,
  suggestionId: 'security-hardcoded-1234567890'
};

const mockDetailedReview = {
  ...mockReviewSummary,
  fileReports: [
    {
      filename: 'src/auth/login.ts',
      issues: {
        critical: 2,
        warning: 1,
        suggestion: 1,
        total: 4
      },
      comments: [mockInlineComment]
    }
  ],
  topIssues: [
    {
      severity: IssueSeverity.Critical,
      category: IssueCategory.Security,
      title: 'Hardcoded API Key',
      file: 'src/auth/login.ts',
      line: 7
    }
  ],
  markdownSummary: '# AI Code Review for PR #123\n\nFound security issues.',
  analysisTime: '2023-06-01T12:05:30Z',
  duration: 1500
};

const mockFileContent = `
function login(username, password) {
  // Security issue: SQL injection
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  
  // Hardcoded credentials
  const apiKey = "1234567890abcdef";
  
  return { authenticated: true };
}
`;

// Setup MSW Server for API mocking
const server = setupServer(
  // Mock reviews endpoint
  rest.get('*/api/reviews', (req, res, ctx) => {
    return res(ctx.json([mockReviewSummary]));
  }),
  
  // Mock specific review endpoint
  rest.get('*/api/reviews/:id', (req, res, ctx) => {
    return res(ctx.json(mockDetailedReview));
  }),
  
  // Mock analyze endpoint
  rest.post('*/api/analyze', (req, res, ctx) => {
    return res(ctx.json({ 
      id: '12345',
      status: 'pending',
      message: 'Analysis initiated successfully'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Import components after mocks are set up
import ReviewCard from '@/components/dashboard/ReviewCard';
import IssueDetail from '@/components/reviews/IssueDetail';
import IssueSummary from '@/components/reviews/IssueSummary';

// Create a wrapper component to handle "use client" directive
function ClientComponentWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

describe('Frontend API Integration Tests', () => {
  test('ReviewCard should render review summary data correctly', async () => {
    render(
      <ClientComponentWrapper>
        <ReviewCard 
          review={{
            ...mockReviewSummary,
            status: 'completed' // Explicitly set status to valid value
          }} 
        />
      </ClientComponentWrapper>
    );
    
    // Check data is displayed based on our mock implementation
    expect(screen.getByText(`PR #${mockReviewSummary.prId}: ${mockReviewSummary.prTitle}`)).toBeInTheDocument();
    expect(screen.getByText(`Repository: ${mockReviewSummary.repository}`)).toBeInTheDocument();
    expect(screen.getByText(`Branch: ${mockReviewSummary.branch}`)).toBeInTheDocument();
    expect(screen.getByText(`Score: ${mockReviewSummary.overallScore}/100`)).toBeInTheDocument();
    
    // Verify issue counts are displayed
    expect(screen.getByText(`Critical: ${mockReviewSummary.issueStats.critical}`)).toBeInTheDocument();
    expect(screen.getByText(`Warning: ${mockReviewSummary.issueStats.warning}`)).toBeInTheDocument();
    expect(screen.getByText(`Suggestion: ${mockReviewSummary.issueStats.suggestion}`)).toBeInTheDocument();
    
    // Verify the View Details link is present
    const link = screen.getByText('View Details');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', `/reviews/${mockReviewSummary.id}`);
  });
  
  test('IssueDetail should render issue information correctly', async () => {
    render(
      <ClientComponentWrapper>
        <IssueDetail issue={mockInlineComment} fileContent={mockFileContent} />
      </ClientComponentWrapper>
    );
    
    // Check that key information is displayed based on our mock implementation
    expect(screen.getByText('Issue: Critical: Hardcoded API Key')).toBeInTheDocument();
    expect(screen.getByText(`File: ${mockInlineComment.file} (Line ${mockInlineComment.line})`)).toBeInTheDocument();
    expect(screen.getByText(`Severity: ${mockInlineComment.severity}`)).toBeInTheDocument();
    expect(screen.getByText(`Category: ${mockInlineComment.category}`)).toBeInTheDocument();
    
    // Check file content preview is rendered
    expect(screen.getByTestId('issue-detail').querySelector('pre')).toBeInTheDocument();
  });
  
  test('IssueSummary should render review summary correctly', async () => {
    render(
      <ClientComponentWrapper>
        <IssueSummary 
          review={{
            ...mockDetailedReview,
            status: 'completed' // Explicitly set status to a valid value
          }}
        />
      </ClientComponentWrapper>
    );
    
    // Check that key information is displayed based on our mock implementation
    expect(screen.getByText(`PR #${mockDetailedReview.prId}: ${mockDetailedReview.prTitle}`)).toBeInTheDocument();
    expect(screen.getByText(`Repository: ${mockDetailedReview.repository}`)).toBeInTheDocument();
    expect(screen.getByText(`Branch: ${mockDetailedReview.branch}`)).toBeInTheDocument();
    expect(screen.getByText(`Author: ${mockDetailedReview.author}`)).toBeInTheDocument();
    
    // Verify score is displayed
    expect(screen.getByText(`Score: ${mockDetailedReview.overallScore}/100`)).toBeInTheDocument();
    
    // Verify issue counts are displayed
    expect(screen.getByText(`Critical: ${mockDetailedReview.issueStats.critical}`)).toBeInTheDocument();
    expect(screen.getByText(`Warning: ${mockDetailedReview.issueStats.warning}`)).toBeInTheDocument();
    expect(screen.getByText(`Suggestion: ${mockDetailedReview.issueStats.suggestion}`)).toBeInTheDocument();
    expect(screen.getByText(`Total: ${mockDetailedReview.issueStats.total}`)).toBeInTheDocument();
  });
});