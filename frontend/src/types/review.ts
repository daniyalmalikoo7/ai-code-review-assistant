// src/types/review.ts

export enum IssueSeverity {
  Critical = 'Critical',
  Warning = 'Warning',
  Suggestion = 'Suggestion'
}

export enum IssueCategory {
  Security = 'Security',
  Performance = 'Performance',
  CodeStyle = 'CodeStyle',
  Maintainability = 'Maintainability',
  Architecture = 'Architecture'
}

export interface CodeIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  snippet?: string;
  remediation?: string;
}

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

export interface ReviewSummary {
  id: string | number;
  prId: string | number;
  prTitle: string;
  repository: string;
  branch: string;
  author: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  overallScore: number;
  issueStats: {
    critical: number;
    warning: number;
    suggestion: number;
    total: number;
  };
}

export interface DetailedReview extends ReviewSummary {
  fileReports: FileReport[];
  topIssues: {
    severity: IssueSeverity;
    category: IssueCategory;
    title: string;
    file: string;
    line?: number;
  }[];
  markdownSummary: string;
  analysisTime: string;
  duration: number;
}

export interface AnalysisRequest {
  repositoryUrl: string;
  prNumber: string | number;
  branch?: string;
  manual?: boolean;
}