// backend/src/controllers/llmController.ts
import { Request, Response } from 'express';
import * as llmService from '../services/llmService';
import { createLogger } from '../utils/logger';
import { userService } from '../services/userService';

const logger = createLogger('LLMController');

/**
 * Analyzes code submitted in the request
 */
export const analyzeCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Get the authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Log the user that's making the request
    logger.info('Analyzing code', { 
      language, 
      userId: req.user.userId,
      username: req.user.username
    });

    // Get user from the database - we might want to apply rate limits or check permissions
    const user = userService.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const analysis = await llmService.analyzeCode(code, language);
    
    return res.status(200).json({ analysis });
  } catch (error) {
    logger.error('Error analyzing code', { error });
    return res.status(500).json({ error: 'An error occurred while analyzing code' });
  }
};

/**
 * Sends a single prompt to the LLM
 */
export const sendPrompt = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prompt, systemPrompt, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get the authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    logger.info('Sending prompt', { 
      userId: req.user.userId, 
      username: req.user.username 
    });
    
    const response = await llmService.sendPrompt(prompt, systemPrompt, options);
    
    return res.status(200).json({ response });
  } catch (error) {
    logger.error('Error sending prompt', { error });
    return res.status(500).json({ error: 'An error occurred while processing the prompt' });
  }
};

/**
 * Executes a chain of prompts
 */
export const executePromptChain = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prompts, options } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: 'Valid prompts array is required' });
    }

    // Get the authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    logger.info('Executing prompt chain', { 
      chainLength: prompts.length,
      userId: req.user.userId, 
      username: req.user.username
    });
    
    const response = await llmService.executePromptChain(prompts, options);
    
    return res.status(200).json({ response });
  } catch (error) {
    logger.error('Error executing prompt chain', { error });
    return res.status(500).json({ error: 'An error occurred while executing the prompt chain' });
  }
}