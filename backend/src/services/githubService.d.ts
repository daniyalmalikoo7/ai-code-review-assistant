// Type declaration file for githubService
import type { InlineComment, SummaryReport } from '../utils/feedbackGenerator';

export function submitFeedbackToGitHub(
  repositoryFullName: string,
  prNumber: string | number,
  feedback: {
    inlineComments: InlineComment[];
    summaryReport: SummaryReport;
    markdownSummary: string;
  }
): Promise<void>;

export function fetchPRFiles(
  repositoryFullName: string,
  prNumber: string | number
): Promise<Array<{
  filename: string;
  status: 'added' | 'modified' | 'removed';
  contents_url: string;
}>>;

export function fetchFileContent(contentsUrl: string): Promise<string>;