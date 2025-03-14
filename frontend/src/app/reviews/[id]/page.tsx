// src/app/reviews/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IssueSummary from '@/components/reviews/IssueSummary';
import IssueList from '@/components/reviews/IssueList';
import IssueDetail from '@/components/reviews/IssueDetail';
import { DetailedReview, InlineComment, IssueSeverity, IssueCategory } from '@/types/review';
import { apiClient } from '@/lib/api';

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id as string;
  
  const [review, setReview] = useState<DetailedReview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<InlineComment | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use API client instead of mock data
        const data = await apiClient.getReviewById(reviewId);
        setReview(data);
        
        if (data.fileReports && data.fileReports.length > 0 && 
            data.fileReports[0].comments && data.fileReports[0].comments.length > 0) {
          setSelectedIssue(data.fileReports[0].comments[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch review:', err);
        setError('Failed to load review details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReview();
  }, [reviewId]);
  
  // useEffect(() => {
  //   const fetchReview = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);
        
  //       // In a real app, we would fetch from the API
  //       // const data = await apiClient.getReviewById(reviewId);
        
  //       // For demo purposes, using mock data
  //       const mockReview: DetailedReview = {
  //         id: reviewId,
  //         prId: 123,
  //         prTitle: 'Add user authentication feature',
  //         repository: 'org/repo',
  //         branch: 'feature/auth',
  //         author: 'johndoe',
  //         status: 'completed',
  //         createdAt: '2023-06-01T12:00:00Z',
  //         completedAt: '2023-06-01T12:05:30Z',
  //         overallScore: 75,
  //         issueStats: {
  //           critical: 2,
  //           warning: 5,
  //           suggestion: 3,
  //           total: 10
  //         },
  //         topIssues: [
  //           {
  //             severity: IssueSeverity.Critical,
  //             category: IssueCategory.Security,
  //             title: 'Hardcoded API Key',
  //             file: 'src/auth/login.ts',
  //             line: 7
  //           },
  //           {
  //             severity: IssueSeverity.Critical,
  //             category: IssueCategory.Security,
  //             title: 'Potential SQL Injection',
  //             file: 'src/auth/login.ts',
  //             line: 3
  //           },
  //           {
  //             severity: IssueSeverity.Warning,
  //             category: IssueCategory.Performance,
  //             title: 'Nested Loop Detected',
  //             file: 'src/auth/login.ts',
  //             line: 10
  //           }
  //         ],
  //         fileReports: [
  //           {
  //             filename: 'src/auth/login.ts',
  //             issues: {
  //               critical: 2,
  //               warning: 3,
  //               suggestion: 2,
  //               total: 7
  //             },
  //             comments: [
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 7,
  //                 message: '🚨 **Critical: Hardcoded API Key**\n\nFound potential hardcoded secret in the code\n\n```\napiKey = "1234567890abcdef"\n```\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Use environment variables or a secure secrets manager instead of hardcoding secrets',
  //                 severity: IssueSeverity.Critical,
  //                 category: IssueCategory.Security,
  //                 suggestionId: 'security-hardcoded-1740620827476-enmanndax'
  //               },
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 3,
  //                 message: '🚨 **Critical: Potential SQL Injection**\n\nString interpolation in SQL queries can lead to SQL injection attacks\n\n```\nconst query = "SELECT * FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\'";\n```\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Use parameterized queries or prepared statements instead of string interpolation',
  //                 severity: IssueSeverity.Critical,
  //                 category: IssueCategory.Security,
  //                 suggestionId: 'security-sql-injection-1740620827476-2nmanxdaz'
  //               },
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 10,
  //                 message: '⚠️ **Warning: Nested Loop Detected**\n\nNested loops can lead to O(n²) time complexity\n\n```\nfor (let i = 0; i < users.length; i++) {\n            for (let j = 0; j < permissions.length; j++)\n```\n\n**Why it matters**: Performance issues can cause your application to run slowly or use excessive resources.\n\n**Recommendation**: Consider alternatives like using hash maps or optimizing the algorithm',
  //                 severity: IssueSeverity.Warning,
  //                 category: IssueCategory.Performance,
  //                 suggestionId: 'performance-nested-loop-1740620827477-6g5ihvfil'
  //               },
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 7,
  //                 message: '💡 **Suggestion: Inconsistent Variable Naming**\n\nVariable names should follow a consistent naming convention\n\n```\nconst apiKey\n```\n\n**Why it matters**: Code style issues affect readability and maintainability of your codebase.\n\n**Recommendation**: Use camelCase for variables and functions, PascalCase for classes and interfaces',
  //                 severity: IssueSeverity.Suggestion,
  //                 category: IssueCategory.CodeStyle,
  //                 suggestionId: 'style-inconsistent-naming-1740620827477-wgdybptaz'
  //               },
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 12,
  //                 message: '💡 **Suggestion: Console Statement**\n\nConsole statements should not be committed to production code\n\n```\nconsole.log(\n```\n\n**Why it matters**: Code style issues affect readability and maintainability of your codebase.\n\n**Recommendation**: Remove console statements or use a proper logging library',
  //                 severity: IssueSeverity.Suggestion,
  //                 category: IssueCategory.CodeStyle,
  //                 suggestionId: 'style-console-statement-1740620827477-qa8sfvjna'
  //               },
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 20,
  //                 message: '⚠️ **Warning: Deep Nesting**\n\nDeeply nested conditionals make code harder to understand\n\n```\nif (user) {\n    if (user.isActive) {\n      if (user.hasPermission) {\n        if (user.groups) {\n          if (user.groups.includes(\'admin\')) {\n```\n\n**Why it matters**: Maintainability issues make your code harder to understand, modify, or extend.\n\n**Recommendation**: Refactor using early returns, guard clauses, or extract conditionals into readable functions',
  //                 severity: IssueSeverity.Warning,
  //                 category: IssueCategory.Maintainability,
  //                 suggestionId: 'maintainability-deep-nesting-1740620827477-7h6jiwfkm'
  //               },
  //               {
  //                 file: 'src/auth/login.ts',
  //                 line: 2,
  //                 message: '⚠️ **Warning: Long Function**\n\nFunction is 28 lines long\n\n**Why it matters**: Maintainability issues make your code harder to understand, modify, or extend.\n\n**Recommendation**: Break down long functions into smaller, more focused functions',
  //                 severity: IssueSeverity.Warning,
  //                 category: IssueCategory.Maintainability,
  //                 suggestionId: 'maintainability-long-function-1740620827478-m97d5agcg'
  //               }
  //             ]
  //           },
  //           {
  //             filename: 'src/controllers/userController.ts',
  //             issues: {
  //               critical: 0,
  //               warning: 2,
  //               suggestion: 1,
  //               total: 3
  //             },
  //             comments: [
  //               {
  //                 file: 'src/controllers/userController.ts',
  //                 line: 4,
  //                 message: '⚠️ **Warning: Architectural Layer Violation**\n\nDirect data access in controller layer\n\n```\nconst user = new User();\nconst result = user.findOne({ id: req.params.id });\n```\n\n**Why it matters**: Architectural issues can lead to design problems that affect the entire system.\n\n**Recommendation**: Move data access code to the service layer or repository layer',
  //                 severity: IssueSeverity.Warning,
  //                 category: IssueCategory.Architecture,
  //                 suggestionId: 'architecture-layer-violation-1740620827478-b8e6fdhpn'
  //               },
  //               {
  //                 file: 'src/controllers/userController.ts',
  //                 line: 10,
  //                 message: '⚠️ **Warning: Architectural Layer Violation**\n\nDirect data access in controller layer\n\n```\nconst newUser = new User(req.body);\nnewUser.save();\n```\n\n**Why it matters**: Architectural issues can lead to design problems that affect the entire system.\n\n**Recommendation**: Move data access code to the service layer or repository layer',
  //                 severity: IssueSeverity.Warning,
  //                 category: IssueCategory.Architecture,
  //                 suggestionId: 'architecture-layer-violation-1740620827478-c9f7geiqo'
  //               },
  //               {
  //                 file: 'src/controllers/userController.ts',
  //                 line: 1,
  //                 message: '💡 **Suggestion: Missing Input Validation**\n\nNo validation for user input from request body\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Add input validation before processing user input',
  //                 severity: IssueSeverity.Suggestion,
  //                 category: IssueCategory.Security,
  //                 suggestionId: 'security-input-validation-1740620827478-d0g8hfjqp'
  //               }
  //             ]
  //           }
  //         ],
  //         markdownSummary: '# AI Code Review for PR #123\n\n## Summary\n\n- **Overall Score**: 75/100\n- **Total Issues**: 10\n  - 🚨 Critical: 2\n  - ⚠️ Warning: 5\n  - 💡 Suggestion: 3\n- **Analysis Time**: 2023-06-01T12:05:30Z\n- **Duration**: 4500ms\n\n## Top Issues\n\n- 🚨 **Critical**: Hardcoded API Key in `src/auth/login.ts` at line 7\n- 🚨 **Critical**: Potential SQL Injection in `src/auth/login.ts` at line 3\n- ⚠️ **Warning**: Nested Loop Detected in `src/auth/login.ts` at line 10\n\n## Files\n\n### src/auth/login.ts\n\n- Total Issues: 7\n  - 🚨 Critical: 2\n  - ⚠️ Warning: 3\n  - 💡 Suggestion: 2\n\n#### Issues\n\n**Line 2**:\n\n- ⚠️ **Warning: Long Function**\n\n**Line 3**:\n\n- 🚨 **Critical: Potential SQL Injection**\n\n**Line 7**:\n\n- 🚨 **Critical: Hardcoded API Key**\n- 💡 **Suggestion: Inconsistent Variable Naming**\n\n**Line 10**:\n\n- ⚠️ **Warning: Nested Loop Detected**\n\n**Line 12**:\n\n- 💡 **Suggestion: Console Statement**\n\n**Line 20**:\n\n- ⚠️ **Warning: Deep Nesting**\n\n### src/controllers/userController.ts\n\n- Total Issues: 3\n  - 🚨 Critical: 0\n  - ⚠️ Warning: 2\n  - 💡 Suggestion: 1\n\n#### Issues\n\n**Line 1**:\n\n- 💡 **Suggestion: Missing Input Validation**\n\n**Line 4**:\n\n- ⚠️ **Warning: Architectural Layer Violation**\n\n**Line 10**:\n\n- ⚠️ **Warning: Architectural Layer Violation**\n\n---\n*Generated by AI-Powered Code Review Assistant*',
  //         analysisTime: '2023-06-01T12:05:30Z',
  //         duration: 4500
  //       };
        
  //       setReview(mockReview);
        
  //       // If there are issues, select the first one by default
  //       if (
  //         mockReview.fileReports &&
  //         mockReview.fileReports.length > 0 &&
  //         mockReview.fileReports[0].comments &&
  //         mockReview.fileReports[0].comments.length > 0
  //       ) {
  //         setSelectedIssue(mockReview.fileReports[0].comments[0]);
  //       }
        
  //       setLoading(false);
  //     } catch (err) {
  //       console.error('Failed to fetch review:', err);
  //       setError('Failed to load review details. Please try again later.');
  //       setLoading(false);
  //     }
  //   };
    
  //   fetchReview();
  // }, [reviewId]);
  
  const handleIssueSelect = (issue: InlineComment) => {
    setSelectedIssue(issue);
  };
  
  // Get all issues from all file reports for issue list
  const allIssues = review?.fileReports?.flatMap(report => report.comments) || [];
  
  // Mock file content for the selected issue
  const mockFileContent = `// Example file content for ${selectedIssue?.file || ''}
function login(username, password) {
  // Security issue: SQL injection vulnerability
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  
  // Security issue: Hardcoded credentials
  const adminPassword = "admin123";
  const apiKey = "1234567890abcdef";
  
  // Performance issue: Nested loops
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < permissions.length; j++) {
      console.log(users[i], permissions[j]);
    }
  }
  
  // Performance issue: Chained array methods
  const result = users
    .filter(user => user.active)
    .map(user => user.permissions)
    .filter(permissions => permissions.includes('admin'))
    .map(permissions => permissions.join(','));
  
  // Deep nesting for maintainability issue
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        if (user.groups) {
          if (user.groups.includes('admin')) {
            // Admin logic
          }
        }
      }
    }
  }
  
  return user;
}`;

  return (
    <DashboardLayout>
      <header className="bg-white shadow-sm mb-6 -mt-6 py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="mr-2 text-blue-600 hover:text-blue-800"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {review ? `Review for PR #${review.prId}` : 'Review Details'}
            </h1>
          </div>
          {review && review.status === 'completed' && (
            <div className="flex items-center space-x-4">
              <span className={`text-xl font-bold ${
                review.overallScore >= 90 ? 'text-green-600' :
                review.overallScore >= 70 ? 'text-amber-500' :
                review.overallScore >= 50 ? 'text-orange-500' : 'text-red-600'
              }`}>
                {review.overallScore}/100
              </span>
            </div>
          )}
        </div>
      </header>
      
      <main>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading review...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : review ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 mb-6">
              <IssueSummary review={review} />
            </div>
            
            <div className="lg:col-span-5 space-y-6">
              <IssueList issues={allIssues} onIssueSelect={handleIssueSelect} />
            </div>
            
            <div className="lg:col-span-7">
              {selectedIssue ? (
                <IssueDetail issue={selectedIssue} fileContent={mockFileContent} />
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center text-gray-500">
                  Select an issue from the list to view details
                </div>
              )}
            </div>
            
            <div className="lg:col-span-12 mt-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Markdown Summary
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">
                      {review.markdownSummary}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </DashboardLayout>
  );
}