// src/app/api/reviews/[id]/route.ts
import { NextResponse } from 'next/server';
import { DetailedReview, IssueSeverity, IssueCategory } from '@/types/review';

/**
 * API route to get a specific review by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get backend URL from environment variables
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Forward the request to the backend
    // In production, we would actually call the backend API
    // For demo purposes, simulate a response with mock data
    /*
    const response = await fetch(`${backendUrl}/api/code-analyzer/reviews/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch review' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    */
    
    // Generate mock data
    const mockReview: DetailedReview = {
      id,
      prId: 123,
      prTitle: 'Add user authentication feature',
      repository: 'org/repo',
      branch: 'feature/auth',
      author: 'johndoe',
      status: 'completed',
      createdAt: '2023-06-01T12:00:00Z',
      completedAt: '2023-06-01T12:05:30Z',
      overallScore: 75,
      issueStats: {
        critical: 2,
        warning: 5,
        suggestion: 3,
        total: 10
      },
      topIssues: [
        {
          severity: IssueSeverity.Critical,
          category: IssueCategory.Security,
          title: 'Hardcoded API Key',
          file: 'src/auth/login.ts',
          line: 7
        },
        {
          severity: IssueSeverity.Critical,
          category: IssueCategory.Security,
          title: 'Potential SQL Injection',
          file: 'src/auth/login.ts',
          line: 3
        },
        {
          severity: IssueSeverity.Warning,
          category: IssueCategory.Performance,
          title: 'Nested Loop Detected',
          file: 'src/auth/login.ts',
          line: 10
        }
      ],
      fileReports: [
        {
          filename: 'src/auth/login.ts',
          issues: {
            critical: 2,
            warning: 3,
            suggestion: 2,
            total: 7
          },
          comments: [
            {
              file: 'src/auth/login.ts',
              line: 7,
              message: '🚨 **Critical: Hardcoded API Key**\n\nFound potential hardcoded secret in the code\n\n```\napiKey = "1234567890abcdef"\n```\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Use environment variables or a secure secrets manager instead of hardcoding secrets',
              severity: IssueSeverity.Critical,
              category: IssueCategory.Security,
              suggestionId: 'security-hardcoded-1740620827476-enmanndax'
            },
            {
              file: 'src/auth/login.ts',
              line: 3,
              message: '🚨 **Critical: Potential SQL Injection**\n\nString interpolation in SQL queries can lead to SQL injection attacks\n\n```\nconst query = "SELECT * FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\'";\n```\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Use parameterized queries or prepared statements instead of string interpolation',
              severity: IssueSeverity.Critical,
              category: IssueCategory.Security,
              suggestionId: 'security-sql-injection-1740620827476-2nmanxdaz'
            },
            {
              file: 'src/auth/login.ts',
              line: 10,
              message: '⚠️ **Warning: Nested Loop Detected**\n\nNested loops can lead to O(n²) time complexity\n\n```\nfor (let i = 0; i < users.length; i++) {\n            for (let j = 0; j < permissions.length; j++)\n```\n\n**Why it matters**: Performance issues can cause your application to run slowly or use excessive resources.\n\n**Recommendation**: Consider alternatives like using hash maps or optimizing the algorithm',
              severity: IssueSeverity.Warning,
              category: IssueCategory.Performance,
              suggestionId: 'performance-nested-loop-1740620827477-6g5ihvfil'
            },
            {
              file: 'src/auth/login.ts',
              line: 7,
              message: '💡 **Suggestion: Inconsistent Variable Naming**\n\nVariable names should follow a consistent naming convention\n\n```\nconst apiKey\n```\n\n**Why it matters**: Code style issues affect readability and maintainability of your codebase.\n\n**Recommendation**: Use camelCase for variables and functions, PascalCase for classes and interfaces',
              severity: IssueSeverity.Suggestion,
              category: IssueCategory.CodeStyle,
              suggestionId: 'style-inconsistent-naming-1740620827477-wgdybptaz'
            },
            {
              file: 'src/auth/login.ts',
              line: 12,
              message: '💡 **Suggestion: Console Statement**\n\nConsole statements should not be committed to production code\n\n```\nconsole.log(\n```\n\n**Why it matters**: Code style issues affect readability and maintainability of your codebase.\n\n**Recommendation**: Remove console statements or use a proper logging library',
              severity: IssueSeverity.Suggestion,
              category: IssueCategory.CodeStyle,
              suggestionId: 'style-console-statement-1740620827477-qa8sfvjna'
            },
            {
              file: 'src/auth/login.ts',
              line: 20,
              message: '⚠️ **Warning: Deep Nesting**\n\nDeeply nested conditionals make code harder to understand\n\n```\nif (user) {\n    if (user.isActive) {\n      if (user.hasPermission) {\n        if (user.groups) {\n          if (user.groups.includes(\'admin\')) {\n```\n\n**Why it matters**: Maintainability issues make your code harder to understand, modify, or extend.\n\n**Recommendation**: Refactor using early returns, guard clauses, or extract conditionals into readable functions',
              severity: IssueSeverity.Warning,
              category: IssueCategory.Maintainability,
              suggestionId: 'maintainability-deep-nesting-1740620827477-7h6jiwfkm'
            },
            {
              file: 'src/auth/login.ts',
              line: 2,
              message: '⚠️ **Warning: Long Function**\n\nFunction is 28 lines long\n\n**Why it matters**: Maintainability issues make your code harder to understand, modify, or extend.\n\n**Recommendation**: Break down long functions into smaller, more focused functions',
              severity: IssueSeverity.Warning,
              category: IssueCategory.Maintainability,
              suggestionId: 'maintainability-long-function-1740620827478-m97d5agcg'
            }
          ]
        },
        {
          filename: 'src/controllers/userController.ts',
          issues: {
            critical: 0,
            warning: 2,
            suggestion: 1,
            total: 3
          },
          comments: [
            {
              file: 'src/controllers/userController.ts',
              line: 4,
              message: '⚠️ **Warning: Architectural Layer Violation**\n\nDirect data access in controller layer\n\n```\nconst user = new User();\nconst result = user.findOne({ id: req.params.id });\n```\n\n**Why it matters**: Architectural issues can lead to design problems that affect the entire system.\n\n**Recommendation**: Move data access code to the service layer or repository layer',
              severity: IssueSeverity.Warning,
              category: IssueCategory.Architecture,
              suggestionId: 'architecture-layer-violation-1740620827478-b8e6fdhpn'
            },
            {
              file: 'src/controllers/userController.ts',
              line: 10,
              message: '⚠️ **Warning: Architectural Layer Violation**\n\nDirect data access in controller layer\n\n```\nconst newUser = new User(req.body);\nnewUser.save();\n```\n\n**Why it matters**: Architectural issues can lead to design problems that affect the entire system.\n\n**Recommendation**: Move data access code to the service layer or repository layer',
              severity: IssueSeverity.Warning,
              category: IssueCategory.Architecture,
              suggestionId: 'architecture-layer-violation-1740620827478-c9f7geiqo'
            },
            {
              file: 'src/controllers/userController.ts',
              line: 1,
              message: '💡 **Suggestion: Missing Input Validation**\n\nNo validation for user input from request body\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Add input validation before processing user input',
              severity: IssueSeverity.Suggestion,
              category: IssueCategory.Security,
              suggestionId: 'security-input-validation-1740620827478-d0g8hfjqp'
            }
          ]
        }
      ],
      markdownSummary: '# AI Code Review for PR #123\n\n## Summary\n\n- **Overall Score**: 75/100\n- **Total Issues**: 10\n  - 🚨 Critical: 2\n  - ⚠️ Warning: 5\n  - 💡 Suggestion: 3\n- **Analysis Time**: 2023-06-01T12:05:30Z\n- **Duration**: 4500ms\n\n## Top Issues\n\n- 🚨 **Critical**: Hardcoded API Key in `src/auth/login.ts` at line 7\n- 🚨 **Critical**: Potential SQL Injection in `src/auth/login.ts` at line 3\n- ⚠️ **Warning**: Nested Loop Detected in `src/auth/login.ts` at line 10\n\n## Files\n\n### src/auth/login.ts\n\n- Total Issues: 7\n  - 🚨 Critical: 2\n  - ⚠️ Warning: 3\n  - 💡 Suggestion: 2\n\n#### Issues\n\n**Line 2**:\n\n- ⚠️ **Warning: Long Function**\n\n**Line 3**:\n\n- 🚨 **Critical: Potential SQL Injection**\n\n**Line 7**:\n\n- 🚨 **Critical: Hardcoded API Key**\n- 💡 **Suggestion: Inconsistent Variable Naming**\n\n**Line 10**:\n\n- ⚠️ **Warning: Nested Loop Detected**\n\n**Line 12**:\n\n- 💡 **Suggestion: Console Statement**\n\n**Line 20**:\n\n- ⚠️ **Warning: Deep Nesting**\n\n### src/controllers/userController.ts\n\n- Total Issues: 3\n  - 🚨 Critical: 0\n  - ⚠️ Warning: 2\n  - 💡 Suggestion: 1\n\n#### Issues\n\n**Line 1**:\n\n- 💡 **Suggestion: Missing Input Validation**\n\n**Line 4**:\n\n- ⚠️ **Warning: Architectural Layer Violation**\n\n**Line 10**:\n\n- ⚠️ **Warning: Architectural Layer Violation**\n\n---\n*Generated by AI-Powered Code Review Assistant*',
      analysisTime: '2023-06-01T12:05:30Z',
      duration: 4500
    };
    
    return NextResponse.json(mockReview);
    
  } catch (error) {
    console.error('Error in review details API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}