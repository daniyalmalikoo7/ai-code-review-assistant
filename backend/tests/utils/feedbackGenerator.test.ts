import {
    generateFeedback,
    generateInlineComments,
    generateSummaryReport,
    generateMarkdownSummary,
    getSeverityEmoji,
    getCategoryExplanation
  } from '../../src/utils/feedbackGenerator';
import { AnalysisResult, IssueSeverity, IssueCategory } from '../../src/utils/codeAnalyzer';
  
  // Mock the logger
  jest.mock('../../src/utils/logger', () => ({
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }))
  }));
  
  describe('Feedback Generator', () => {
    // Sample analysis result for testing
    const sampleAnalysis: AnalysisResult = {
      prId: 123,
      issues: [
        {
          id: 'security-1',
          title: 'Hardcoded API Key',
          description: 'Found potential hardcoded API key in the code',
          category: IssueCategory.Security,
          severity: IssueSeverity.Critical,
          location: {
            file: 'src/auth/auth.service.ts',
            line: 42
          },
          snippet: 'const apiKey = "1234567890abcdef";',
          remediation: 'Use environment variables or a secure secrets manager instead of hardcoding API keys'
        },
        {
          id: 'performance-1',
          title: 'Nested Loop Detected',
          description: 'Nested loops can lead to O(n²) time complexity',
          category: IssueCategory.Performance,
          severity: IssueSeverity.Warning,
          location: {
            file: 'src/data/processor.ts',
            line: 156
          },
          snippet: 'for (let i = 0; i < items.length; i++) {\n  for (let j = 0; j < items.length; j++) {\n    // ...\n  }\n}',
          remediation: 'Consider alternatives like using hash maps or optimizing the algorithm'
        },
        {
          id: 'style-1',
          title: 'Console Statement',
          description: 'Console statements should not be committed to production code',
          category: IssueCategory.CodeStyle,
          severity: IssueSeverity.Suggestion,
          location: {
            file: 'src/components/user-list.ts',
            line: 78
          },
          snippet: 'console.log("Rendering user list");',
          remediation: 'Remove console statements or use a proper logging library'
        },
        {
          id: 'architecture-1',
          title: 'Layer Violation',
          description: 'Data access in controller layer',
          category: IssueCategory.Architecture,
          severity: IssueSeverity.Warning,
          location: {
            file: 'src/controllers/user.controller.ts',
            line: 25
          },
          remediation: 'Move data access code to the service layer'
        }
      ],
      summary: {
        totalIssues: 4,
        criticalCount: 1,
        warningCount: 2,
        suggestionCount: 1,
        issuesByCategory: {
          [IssueCategory.Security]: 1,
          [IssueCategory.Performance]: 1,
          [IssueCategory.CodeStyle]: 1,
          [IssueCategory.Maintainability]: 0,
          [IssueCategory.Architecture]: 1
        }
      },
      metadata: {
        analyzedAt: '2023-06-01T12:00:00Z',
        duration: 1500
      }
    };
  
    describe('getSeverityEmoji', () => {
      it('should return the correct emoji for each severity level', () => {
        expect(getSeverityEmoji(IssueSeverity.Critical)).toBe('🚨');
        expect(getSeverityEmoji(IssueSeverity.Warning)).toBe('⚠️');
        expect(getSeverityEmoji(IssueSeverity.Suggestion)).toBe('💡');
      });
    });
  
    describe('getCategoryExplanation', () => {
      it('should return the correct explanation for each category', () => {
        expect(getCategoryExplanation(IssueCategory.Security)).toContain('vulnerabilities');
        expect(getCategoryExplanation(IssueCategory.Performance)).toContain('slowly');
        expect(getCategoryExplanation(IssueCategory.CodeStyle)).toContain('readability');
        expect(getCategoryExplanation(IssueCategory.Maintainability)).toContain('harder to understand');
        expect(getCategoryExplanation(IssueCategory.Architecture)).toContain('design problems');
      });
    });
  
    describe('generateInlineComments', () => {
      it('should generate inline comments for issues with line numbers', () => {
        const comments = generateInlineComments(sampleAnalysis);
        
        expect(comments.length).toBe(4);
        expect(comments[0].file).toBe('src/auth/auth.service.ts');
        expect(comments[0].line).toBe(42);
        expect(comments[0].message).toContain('🚨');
        expect(comments[0].message).toContain('Hardcoded API Key');
      });
  
      it('should skip issues without line numbers', () => {
        const analysisWithoutLines: AnalysisResult = {
          ...sampleAnalysis,
          issues: [
            {
              ...sampleAnalysis.issues[0],
              location: { file: 'src/auth/auth.service.ts' }
            }
          ],
          summary: {
            ...sampleAnalysis.summary,
            totalIssues: 1
          }
        };
        
        const comments = generateInlineComments(analysisWithoutLines);
        expect(comments.length).toBe(0);
      });
  
      it('should include code snippets when available', () => {
        const comments = generateInlineComments(sampleAnalysis);
        const apiKeyComment = comments.find(c => c.file === 'src/auth/auth.service.ts');
        
        expect(apiKeyComment?.message).toContain('```');
        expect(apiKeyComment?.message).toContain('const apiKey = "1234567890abcdef";');
      });
  
      it('should include remediation instructions when available', () => {
        const comments = generateInlineComments(sampleAnalysis);
        const apiKeyComment = comments.find(c => c.file === 'src/auth/auth.service.ts');
        
        expect(apiKeyComment?.message).toContain('**Recommendation**');
        expect(apiKeyComment?.message).toContain('environment variables');
      });
    });
  
    describe('generateSummaryReport', () => {
      it('should generate a summary report with correct statistics', () => {
        const report = generateSummaryReport(sampleAnalysis, 'Test Review');
        
        expect(report.prId).toBe(123);
        expect(report.title).toBe('Test Review');
        expect(report.issueStats.critical).toBe(1);
        expect(report.issueStats.warning).toBe(2);
        expect(report.issueStats.suggestion).toBe(1);
        expect(report.issueStats.total).toBe(4);
        expect(report.topIssues.length).toBeGreaterThan(0);
        expect(report.topIssues[0].severity).toBe(IssueSeverity.Critical);
        expect(report.fileReports.length).toBeGreaterThan(0);
      });
  
      it('should calculate an overall score based on issue counts', () => {
        const report = generateSummaryReport(sampleAnalysis);
        
        // Score should be reduced from 100 based on issues (1 critical = -10, 2 warnings = -6, 1 suggestion = -1)
        expect(report.overallScore).toBe(83);
        
        // Test with only suggestions (should have a higher score)
        const suggestionOnlyAnalysis: AnalysisResult = {
          ...sampleAnalysis,
          issues: [
            {
              ...sampleAnalysis.issues[2] // The suggestion issue
            }
          ],
          summary: {
            ...sampleAnalysis.summary,
            totalIssues: 1,
            criticalCount: 0,
            warningCount: 0,
            suggestionCount: 1
          }
        };
        
        const suggestionReport = generateSummaryReport(suggestionOnlyAnalysis);
        expect(suggestionReport.overallScore).toBe(99);
      });
  
      it('should sort file reports by issue severity', () => {
        const report = generateSummaryReport(sampleAnalysis);
        
        // First file should have the critical issue
        expect(report.fileReports[0].filename).toBe('src/auth/auth.service.ts');
        expect(report.fileReports[0].issues.critical).toBe(1);
      });
    });
  
    describe('generateMarkdownSummary', () => {
      it('should generate a markdown summary with all sections', () => {
        const report = generateSummaryReport(sampleAnalysis);
        const markdown = generateMarkdownSummary(report);
        
        expect(markdown).toContain('# AI Code Review for PR #123');
        expect(markdown).toContain('## Summary');
        expect(markdown).toContain('## Top Issues');
        expect(markdown).toContain('## Files');
        expect(markdown).toContain('🚨 Critical: 1');
        expect(markdown).toContain('⚠️ Warning: 2');
        expect(markdown).toContain('💡 Suggestion: 1');
        expect(markdown).toContain('src/auth/auth.service.ts');
        expect(markdown).toContain('*Generated by AI-Powered Code Review Assistant*');
      });
  
      it('should include line numbers in file sections', () => {
        const report = generateSummaryReport(sampleAnalysis);
        const markdown = generateMarkdownSummary(report);
        
        expect(markdown).toContain('**Line 42**');
        expect(markdown).toContain('**Line 156**');
        expect(markdown).toContain('**Line 78**');
        expect(markdown).toContain('**Line 25**');
      });
    });
  
    describe('generateFeedback', () => {
      it('should generate complete feedback with inline comments and summary', () => {
        const feedback = generateFeedback(sampleAnalysis);
        
        expect(feedback.inlineComments).toBeDefined();
        expect(feedback.inlineComments.length).toBe(4);
        expect(feedback.summaryReport).toBeDefined();
        expect(feedback.markdownSummary).toBeDefined();
        expect(feedback.markdownSummary).toContain('# AI Code Review for PR #123');
      });
  
      it('should use custom title when provided', () => {
        const feedback = generateFeedback(sampleAnalysis, 'Custom Review Title');
        
        expect(feedback.summaryReport.title).toBe('Custom Review Title');
        expect(feedback.markdownSummary).toContain('# Custom Review Title for PR #123');
      });
    });
  });