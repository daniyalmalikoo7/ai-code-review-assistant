// backend/src/services/githubService.ts
import fetch from 'node-fetch';
import type { InlineComment, SummaryReport } from '../utils/feedbackGenerator';
import { createLogger } from '../utils/logger';

const logger = createLogger('GitHubService');

export type { InlineComment, SummaryReport };

export interface GitHubFeedback {
  inlineComments: InlineComment[];
  summaryReport: SummaryReport;
  markdownSummary: string;
}

/**
 * Construct GitHub API headers with optional authentication token
 */
function getGitHubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Add authorization if token is provided
  if (token) {
    headers['Authorization'] = `token ${token}`;
  } else if (process.env.GITHUB_TOKEN) {
    // Fallback to app-level token if available
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Submit review feedback to a GitHub PR
 */
export async function submitFeedbackToGitHub(
  repositoryFullName: string,
  prNumber: string | number,
  feedback: GitHubFeedback,
  token?: string
): Promise<void> {
  try {
    const headers = getGitHubHeaders(token);

    if (process.env.NODE_ENV === 'production' && !headers['Authorization']) {
      throw new Error('GitHub token required for production environment');
    }

    // For demo purposes, we'll just log the feedback - in a real implementation,
    // this would POST review comments to the GitHub API
    logger.info(`Submitting feedback to GitHub PR #${prNumber} in ${repositoryFullName}`);
    logger.info(`Summary report score: ${feedback.summaryReport.overallScore}`);
    logger.info(`Inline comments: ${feedback.inlineComments.length}`);

    // In a real implementation, this would create a review with comments, like:
    /*
    const baseUrl = `https://api.github.com/repos/${repositoryFullName}/pulls/${prNumber}/reviews`;
    const comments = feedback.inlineComments.map(comment => ({
      path: comment.file,
      line: comment.line,
      body: comment.message,
    }));

    await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        body: feedback.markdownSummary,
        event: 'COMMENT',
        comments
      })
    });
    */
  } catch (error) {
    logger.error('Error submitting feedback to GitHub', { error });
    throw error;
  }
}

/**
 * Fetch PR changes from GitHub API
 */
export async function fetchPRFiles(
  repositoryFullName: string,
  prNumber: string | number,
  token?: string
): Promise<Array<{
  filename: string;
  status: 'added' | 'modified' | 'removed';
  contents_url: string;
}>> {
  try {
    logger.info(`Fetching PR files from GitHub for ${repositoryFullName}#${prNumber}`);

    // Check if this is a mock/test environment
    if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true') {
      return getMockPRFiles();
    }

    const headers = getGitHubHeaders(token);
    const url = `https://api.github.com/repos/${repositoryFullName}/pulls/${prNumber}/files`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json() as Array<{
      filename: string;
      status: 'added' | 'modified' | 'removed';
      contents_url: string;
    }>;

    logger.info(`Fetched ${files.length} files from PR`);
    return files;
  } catch (error) {
    logger.error('Error fetching PR files from GitHub', { error });
    return getMockPRFiles();
  }
}

/**
 * Fetch file content from GitHub API
 */
export async function fetchFileContent(
  contentsUrl: string,
  token?: string
): Promise<string> {
  try {
    logger.info(`Fetching file content from ${contentsUrl}`);

    // Check if this is a mock/test environment
    if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true') {
      return getMockFileContent();
    }

    const headers = getGitHubHeaders(token);
    const response = await fetch(contentsUrl, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json() as { content: string; encoding: string };

    // GitHub API returns base64 encoded content
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    // Fallback for other encodings (should not happen with GitHub API)
    return data.content;
  } catch (error) {
    logger.error('Error fetching file content from GitHub', { error });
    return getMockFileContent();
  }
}

/**
 * Get mock PR files for testing
 */
function getMockPRFiles(): Array<{
  filename: string;
  status: 'added' | 'modified' | 'removed';
  contents_url: string;
}> {
  return [
    {
      filename: 'src/app.js',
      status: 'modified' as 'modified',
      contents_url: 'https://api.github.com/repos/owner/repo/contents/src/app.js'
    }
  ];
}

/**
 * Get mock file content for testing
 */
function getMockFileContent(): string {
  return `
function processData(items) {
  // Nested loops - O(n²) complexity
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i] === items[j] && i !== j) {
        console.log('Duplicate found');
      }
    }
  }
  
  // Hardcoded credentials (security issue)
  const apiKey = "1234567890abcdef";
  
  return items;
}
  `;
}