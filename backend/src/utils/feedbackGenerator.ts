import { AnalysisResult, CodeIssue, IssueSeverity, IssueCategory } from './codeAnalyzer';
import { createLogger } from './logger';

// Create a logger for the feedback generator
const logger = createLogger('FeedbackGenerator');

// Define output interfaces
export interface InlineComment {
  file: string;
  line: number;
  message: string;
  severity: IssueSeverity;
  category: IssueCategory;
  suggestionId: string;
}

export interface FileReport {
  filename: string;
  issues: {
    critical: number;
    warning: number;
    suggestion: number;
    total: number;
  };
  comments: InlineComment[];
}

export interface SummaryReport {
  prId: string | number;
  title: string;
  overallScore: number;  // 0-100
  issueStats: {
    critical: number;
    warning: number;
    suggestion: number;
    total: number;
  };
  topIssues: {
    severity: IssueSeverity;
    category: IssueCategory;
    title: string;
    file: string;
    line?: number;
  }[];
  fileReports: FileReport[];
  analysisTime: string;
  duration: number;
}

/**
 * Get emoji representation for issue severity
 */
export function getSeverityEmoji(severity: IssueSeverity): string {
  switch (severity) {
    case IssueSeverity.Critical:
      return '🚨';
    case IssueSeverity.Warning:
      return '⚠️';
    case IssueSeverity.Suggestion:
      return '💡';
    default:
      return '';
  }
}

/**
 * Get explanation for why a particular issue category matters
 */
export function getCategoryExplanation(category: IssueCategory): string {
  switch (category) {
    case IssueCategory.Security:
      return 'Security issues can lead to vulnerabilities that may be exploited by attackers.';
    case IssueCategory.Performance:
      return 'Performance issues can cause your application to run slowly or use excessive resources.';
    case IssueCategory.CodeStyle:
      return 'Code style issues affect readability and maintainability of your codebase.';
    case IssueCategory.Maintainability:
      return 'Maintainability issues make your code harder to understand, modify, or extend.';
    case IssueCategory.Architecture:
      return 'Architectural issues can lead to design problems that affect the entire system.';
    default:
      return 'This issue affects the quality of your code.';
  }
}

/**
 * Generate inline comments from analysis results
 */
export function generateInlineComments(analysis: AnalysisResult): InlineComment[] {
  const comments: InlineComment[] = [];

  logger.info(`Generating inline comments for PR #${analysis.prId}`);

  analysis.issues.forEach(issue => {
    // Skip issues without line numbers
    if (!issue.location.line) {
      logger.debug(`Skipping issue without line number: ${issue.title}`);
      return;
    }

    comments.push({
      file: issue.location.file,
      line: issue.location.line,
      message: formatInlineComment(issue),
      severity: issue.severity,
      category: issue.category,
      suggestionId: issue.id
    });
  });

  logger.info(`Generated ${comments.length} inline comments`);
  return comments;
}

/**
 * Format an issue as an inline comment
 */
function formatInlineComment(issue: CodeIssue): string {
  const emoji = getSeverityEmoji(issue.severity);
  const explanation = getCategoryExplanation(issue.category);
  
  let comment = `${emoji} **${issue.severity}: ${issue.title}**\n\n`;
  comment += `${issue.description}\n\n`;
  
  if (issue.snippet) {
    comment += `\`\`\`\n${issue.snippet}\n\`\`\`\n\n`;
  }
  
  comment += `**Why it matters**: ${explanation}\n`;
  
  if (issue.remediation) {
    comment += `\n**Recommendation**: ${issue.remediation}`;
  }
  
  return comment;
}

/**
 * Generate file reports from analysis results
 */
export function generateFileReports(analysis: AnalysisResult): FileReport[] {
  const inlineComments = generateInlineComments(analysis);
  const fileMap = new Map<string, InlineComment[]>();
  
  // Group comments by file
  inlineComments.forEach(comment => {
    if (!fileMap.has(comment.file)) {
      fileMap.set(comment.file, []);
    }
    fileMap.get(comment.file)!.push(comment);
  });
  
  // Create file reports
  const fileReports: FileReport[] = [];
  
  fileMap.forEach((comments, filename) => {
    const critical = comments.filter(c => c.severity === IssueSeverity.Critical).length;
    const warning = comments.filter(c => c.severity === IssueSeverity.Warning).length;
    const suggestion = comments.filter(c => c.severity === IssueSeverity.Suggestion).length;
    
    fileReports.push({
      filename,
      issues: {
        critical,
        warning,
        suggestion,
        total: critical + warning + suggestion
      },
      comments
    });
  });
  
  return fileReports.sort((a, b) => {
    // Sort by critical issues first, then warnings, then total issues
    if (a.issues.critical !== b.issues.critical) {
      return b.issues.critical - a.issues.critical;
    }
    if (a.issues.warning !== b.issues.warning) {
      return b.issues.warning - a.issues.warning;
    }
    return b.issues.total - a.issues.total;
  });
}

/**
 * Calculate an overall score for the code review
 */
function calculateScore(analysis: AnalysisResult): number {
  const { criticalCount, warningCount, suggestionCount } = analysis.summary;
  
  // Base score is 100
  let score = 100;
  
  // Deduct points for issues based on severity
  score -= criticalCount * 10;  // Critical issues have major impact
  score -= warningCount * 3;    // Warnings have moderate impact
  score -= suggestionCount * 1; // Suggestions have minor impact
  
  // Ensure score doesn't go below 0
  return Math.max(0, Math.round(score));
}

/**
 * Find the top issues (most severe) from the analysis
 */
function findTopIssues(analysis: AnalysisResult, limit: number = 5): SummaryReport['topIssues'] {
  // Sort issues by severity (critical first, then warning, then suggestion)
  const sortedIssues = [...analysis.issues].sort((a, b) => {
    // Compare severity first
    const severityOrder = { 
      [IssueSeverity.Critical]: 0, 
      [IssueSeverity.Warning]: 1, 
      [IssueSeverity.Suggestion]: 2 
    };
    
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  // Take the top N issues
  return sortedIssues.slice(0, limit).map(issue => ({
    severity: issue.severity,
    category: issue.category,
    title: issue.title,
    file: issue.location.file,
    line: issue.location.line
  }));
}

/**
 * Generate a summary report from analysis results
 */
export function generateSummaryReport(analysis: AnalysisResult, title: string = 'AI Code Review'): SummaryReport {
  logger.info(`Generating summary report for PR #${analysis.prId}`);
  
  const fileReports = generateFileReports(analysis);
  const score = calculateScore(analysis);
  const topIssues = findTopIssues(analysis);
  
  const summaryReport: SummaryReport = {
    prId: analysis.prId,
    title,
    overallScore: score,
    issueStats: {
      critical: analysis.summary.criticalCount,
      warning: analysis.summary.warningCount,
      suggestion: analysis.summary.suggestionCount,
      total: analysis.summary.totalIssues
    },
    topIssues,
    fileReports,
    analysisTime: analysis.metadata.analyzedAt,
    duration: analysis.metadata.duration
  };
  
  logger.info(`Generated summary report with overall score: ${score}`);
  return summaryReport;
}

/**
 * Generate a markdown summary from the summary report
 */
export function generateMarkdownSummary(summary: SummaryReport): string {
  let markdown = `# ${summary.title} for PR #${summary.prId}\n\n`;
  
  // Overall score and stats
  markdown += `## Summary\n\n`;
  markdown += `- **Overall Score**: ${summary.overallScore}/100\n`;
  markdown += `- **Total Issues**: ${summary.issueStats.total}\n`;
  markdown += `  - 🚨 Critical: ${summary.issueStats.critical}\n`;
  markdown += `  - ⚠️ Warning: ${summary.issueStats.warning}\n`;
  markdown += `  - 💡 Suggestion: ${summary.issueStats.suggestion}\n`;
  markdown += `- **Analysis Time**: ${summary.analysisTime}\n`;
  markdown += `- **Duration**: ${summary.duration}ms\n\n`;
  
  // Top issues
  if (summary.topIssues.length > 0) {
    markdown += `## Top Issues\n\n`;
    
    summary.topIssues.forEach(issue => {
      const emoji = getSeverityEmoji(issue.severity);
      markdown += `- ${emoji} **${issue.severity}**: ${issue.title} in \`${issue.file}\``;
      if (issue.line) {
        markdown += ` at line ${issue.line}`;
      }
      markdown += `\n`;
    });
    
    markdown += `\n`;
  }
  
  // File reports
  if (summary.fileReports.length > 0) {
    markdown += `## Files\n\n`;
    
    summary.fileReports.forEach(file => {
      markdown += `### ${file.filename}\n\n`;
      markdown += `- Total Issues: ${file.issues.total}\n`;
      markdown += `  - 🚨 Critical: ${file.issues.critical}\n`;
      markdown += `  - ⚠️ Warning: ${file.issues.warning}\n`;
      markdown += `  - 💡 Suggestion: ${file.issues.suggestion}\n\n`;
      
      if (file.comments.length > 0) {
        markdown += `#### Issues\n\n`;
        
        // Group comments by line number
        const commentsByLine = new Map<number, InlineComment[]>();
        file.comments.forEach(comment => {
          if (!commentsByLine.has(comment.line)) {
            commentsByLine.set(comment.line, []);
          }
          commentsByLine.get(comment.line)!.push(comment);
        });
        
        // Sort line numbers
        const sortedLines = Array.from(commentsByLine.keys()).sort((a, b) => a - b);
        
        sortedLines.forEach(line => {
          const lineComments = commentsByLine.get(line)!;
          
          markdown += `**Line ${line}**:\n\n`;
          
          lineComments.forEach(comment => {
            const emoji = getSeverityEmoji(comment.severity);
            markdown += `- ${emoji} ${comment.message.split('\n')[0]}\n`;
          });
          
          markdown += `\n`;
        });
      }
    });
  }
  
  markdown += `---\n*Generated by AI-Powered Code Review Assistant*`;
  
  return markdown;
}

/**
 * Generate HTML summary from the summary report
 */
export function generateHtmlSummary(summary: SummaryReport): string {
  // Implementation for HTML summary (could be expanded for a richer UI representation)
  return `<h1>Code Review Summary for PR #${summary.prId}</h1>
<p>Score: ${summary.overallScore}/100</p>
<p>Total Issues: ${summary.issueStats.total}</p>
<ul>
  <li>🚨 Critical: ${summary.issueStats.critical}</li>
  <li>⚠️ Warning: ${summary.issueStats.warning}</li>
  <li>💡 Suggestion: ${summary.issueStats.suggestion}</li>
</ul>`;
}

/**
 * Generate complete feedback from analysis results
 */
export function generateFeedback(analysis: AnalysisResult, title: string = 'AI Code Review') {
  logger.info(`Generating feedback for PR #${analysis.prId}`);
  
  const inlineComments = generateInlineComments(analysis);
  const summaryReport = generateSummaryReport(analysis, title);
  const markdownSummary = generateMarkdownSummary(summaryReport);
  
  return {
    inlineComments,
    summaryReport,
    markdownSummary
  };
}

export default {
  generateFeedback,
  generateInlineComments,
  generateSummaryReport,
  generateMarkdownSummary,
  generateHtmlSummary,
  getSeverityEmoji,
  getCategoryExplanation
};