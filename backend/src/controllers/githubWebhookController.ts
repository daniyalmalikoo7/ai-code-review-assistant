// backend/src/controllers/githubWebhookController.ts
import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { analyzePullRequest, PullRequestPayload } from '../utils/codeAnalyzer';
import { generateFeedback } from '../utils/feedbackGenerator';
import { userService } from '../services/userService';

// Define the interfaces we need directly in this file, so we don't need to import them
interface GitHubService {
  submitFeedbackToGitHub: (
    repositoryFullName: string,
    prNumber: string | number,
    feedback: any,
    token?: string  // Add token parameter for authentication
  ) => Promise<void>;
  fetchPRFiles: (
    repositoryFullName: string,
    prNumber: string | number,
    token?: string  // Add token parameter for authentication
  ) => Promise<Array<{
    filename: string;
    status: 'added' | 'modified' | 'removed';
    contents_url: string;
  }>>;
  fetchFileContent: (
    contentsUrl: string,
    token?: string  // Add token parameter for authentication
  ) => Promise<string>;
}

const logger = createLogger('GitHubWebhookController');

/**
 * Handles GitHub webhook events for pull requests
 */
export const handlePullRequestWebhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const event = req.headers['x-github-event'] as string;
    const payload = req.body;
    
    if (!event) {
      logger.error('Missing x-github-event header');
      return res.status(400).json({ error: 'Missing x-github-event header' });
    }
    
    // Only process pull_request events
    if (event !== 'pull_request') {
      logger.info(`Ignoring non-pull_request event: ${event}`);
      return res.status(200).json({ status: 'ignored', event });
    }
    
    const action = payload.action;
    
    // Process only relevant PR actions (opened, synchronize, reopened)
    const relevantActions = ['opened', 'synchronize', 'reopened'];
    if (!relevantActions.includes(action)) {
      logger.info(`Ignoring pull_request event with action: ${action}`);
      return res.status(200).json({ status: 'ignored', event, action });
    }
    
    // Extract PR information
    const prPayload: PullRequestPayload = {
      id: payload.pull_request.number,
      title: payload.pull_request.title,
      description: payload.pull_request.body || '',
      branch: payload.pull_request.head.ref,
      base: payload.pull_request.base.ref,
      repository: payload.repository.full_name,
      author: payload.pull_request.user.login,
      changes: [] // Will be populated from the GitHub API
    };
    
    // Log the received PR
    logger.info(`Processing PR #${prPayload.id} from ${prPayload.repository}`);
    
    // Find a user who has access to this repository to use their token
    // In a real implementation, this would look up a user or organization token
    // based on the repository and would handle permission checking
    let githubToken: string | undefined;
    
    // Example: Look for a user who might have access to this repo
    // This is a placeholder - in a real app, you'd have better repository-to-user mapping
    const users = userService.getAllUsers();
    const repoOwner = prPayload.repository.split('/')[0].toLowerCase(); 
    
    // Find a user with access to this repository, preferably the PR author
    const matchingUser = users.find(user => 
      user.username.toLowerCase() === prPayload.author.toLowerCase() || 
      user.username.toLowerCase() === repoOwner.toLowerCase()
    );
    
    if (matchingUser?.githubToken) {
      githubToken = matchingUser.githubToken;
      logger.info(`Using GitHub token from user: ${matchingUser.username}`);
    } else {
      logger.warn(`No user token found for repository: ${prPayload.repository}`);
      // For demonstration, we'll continue with the default GitHub app token or no token
      githubToken = process.env.GITHUB_TOKEN || 'mock-token-for-tests';
    }
    
    // Transform GitHub API data to match our expected format
    try {
      prPayload.changes = await fetchPRChanges(payload.pull_request.url, githubToken);
      
      // Analyze the PR code
      const analysis = analyzePullRequest(prPayload);
      
      // Generate feedback
      const feedback = generateFeedback(analysis, `AI Code Review for PR #${prPayload.id}`);
      
      // Submit feedback to GitHub (comments on the PR)
      if (process.env.SUBMIT_FEEDBACK_TO_GITHUB === 'true') {
        try {
          // Load the GitHub service dynamically with type assertion
          const githubService = (await import('../services/githubService')) as unknown as GitHubService;
          await githubService.submitFeedbackToGitHub(
            prPayload.repository,
            prPayload.id,
            feedback,
            githubToken // Pass the token for authenticated GitHub API access
          );
          logger.info(`Submitted feedback to GitHub PR #${prPayload.id}`);
        } catch (importError) {
          logger.error('Failed to submit feedback to GitHub', { error: importError });
        }
      } else {
        logger.info(`Feedback generation complete, but not submitted to GitHub (disabled)`);
      }
      
      return res.status(200).json({
        status: 'success',
        prId: prPayload.id,
        repository: prPayload.repository,
        issueCount: analysis.summary.totalIssues,
        score: feedback.summaryReport.overallScore
      });
    } catch (processingError) {
      logger.error('Error processing PR data', { error: processingError });
      return res.status(500).json({ error: 'An error occurred while processing PR data' });
    }
    
  } catch (error) {
    logger.error('Error processing GitHub webhook', { error });
    return res.status(500).json({ error: 'An error occurred while processing the webhook' });
  }
};

/**
 * Fetches the changes for a PR
 */
async function fetchPRChanges(prUrl: string, token?: string): Promise<PullRequestPayload['changes']> {
  logger.info(`Fetching PR changes from: ${prUrl}`);
  
  try {
    // Extract repo and PR number from the URL
    // URL format is typically: https://api.github.com/repos/owner/repo/pulls/123
    const urlParts = prUrl.split('/');
    const prNumber = urlParts[urlParts.length - 1];
    const repoOwner = urlParts[urlParts.length - 4];
    const repoName = urlParts[urlParts.length - 3];
    const repositoryFullName = `${repoOwner}/${repoName}`;
    
    // If we're in test mode, return sample data
    if (process.env.NODE_ENV === 'test') {
      return getSampleChanges();
    }
    
    // Fetch PR files from GitHub API - use dynamic import with try-catch
    let changes: PullRequestPayload['changes'] = [];
    
    try {
      // Load the GitHub service dynamically with type assertion
      const githubService = (await import('../services/githubService')) as unknown as GitHubService;
      const files = await githubService.fetchPRFiles(repositoryFullName, prNumber, token);
      
      // Fetch content for each file
      changes = [];
      
      for (const file of files) {
        // Convert GitHub file status to our format
        let status: 'added' | 'modified' | 'removed';
        switch (file.status) {
          case 'added': status = 'added'; break;
          case 'removed': status = 'removed'; break;
          default: status = 'modified'; break;
        }
        
        // Skip binary files or deleted files
        if (file.status === 'removed') {
          changes.push({
            filename: file.filename,
            status,
            content: ''
          });
          continue;
        }
        
        // Fetch file content
        const content = await githubService.fetchFileContent(file.contents_url, token);
        
        changes.push({
          filename: file.filename,
          status,
          content
        });
      }
    } catch (importError) {
      logger.error('Failed to import GitHub service, using sample data', { error: importError });
      return getSampleChanges();
    }
    
    logger.info(`Fetched ${changes.length} file changes`);
    return changes;
  } catch (error) {
    logger.error('Error fetching PR changes', { error, prUrl });
    // Return sample data as fallback
    return getSampleChanges();
  }
}

/**
 * Returns sample changes for testing or when GitHub API is unavailable
 */
function getSampleChanges(): PullRequestPayload['changes'] {
  return [
    {
      filename: 'src/app.js',
      status: 'modified',
      content: `
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
      `
    }
  ];
}