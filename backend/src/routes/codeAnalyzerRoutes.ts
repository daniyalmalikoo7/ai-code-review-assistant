// backend/src/routes/codeAnalyzerRoutes.ts
import { Router, Request, Response } from 'express';
import { analyzePullRequest, PullRequestPayload } from '../utils/codeAnalyzer';
import { generateFeedback } from '../utils/feedbackGenerator';
import { createLogger } from '../utils/logger';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const logger = createLogger('CodeAnalyzerRoutes');

// All routes in this file require authentication
router.use(authenticate);

// Define the handler function separately to fix TypeScript errors
const analyzePRHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const prPayload: PullRequestPayload = req.body;
    
    if (!prPayload || !prPayload.changes || !Array.isArray(prPayload.changes)) {
      res.status(400).json({ error: 'Invalid PR payload. Must include changes array.' });
      return;
    }
    
    logger.info(`Analyzing PR #${prPayload.id} with ${prPayload.changes.length} files`, {
      userId: req.user?.userId,
      username: req.user?.username
    });
    
    const analysis = analyzePullRequest(prPayload);
    
    // Log a summary of the analysis
    logger.info(`Analysis complete. Found ${analysis.summary.totalIssues} issues.`, {
      criticalCount: analysis.summary.criticalCount,
      warningCount: analysis.summary.warningCount,
      suggestionCount: analysis.summary.suggestionCount
    });
    
    res.status(200).json(analysis);
  } catch (error) {
    logger.error('Error analyzing PR', { error });
    res.status(500).json({ error: 'An error occurred while analyzing the PR' });
  }
};

// Handler that includes feedback generation
const analyzePRWithFeedbackHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const prPayload: PullRequestPayload = req.body;
    
    if (!prPayload || !prPayload.changes || !Array.isArray(prPayload.changes)) {
      res.status(400).json({ error: 'Invalid PR payload. Must include changes array.' });
      return;
    }
    
    logger.info(`Analyzing PR #${prPayload.id} with ${prPayload.changes.length} files`, {
      userId: req.user?.userId,
      username: req.user?.username
    });
    
    // Run analysis
    const analysis = analyzePullRequest(prPayload);
    
    // Generate feedback
    const feedback = generateFeedback(analysis, `Code Review for PR #${prPayload.id}`);
    
    logger.info(`Feedback generated with score: ${feedback.summaryReport.overallScore}/100`);
    
    // Return both analysis and feedback
    res.status(200).json({
      analysis,
      feedback
    });
  } catch (error) {
    logger.error('Error analyzing PR with feedback', { error });
    res.status(500).json({ error: 'An error occurred while processing the PR' });
  }
};

// Analyze a pull request
router.post('/analyze-pr', analyzePRHandler);

// Analyze a pull request and generate feedback
router.post('/analyze-pr-with-feedback', analyzePRWithFeedbackHandler);

export default router;