import { Router, Request, Response } from 'express';
import * as llmController from '../controllers/llmController';

const router = Router();

// Define routes with explicit handler functions
router.post('/analyze', async (req: Request, res: Response) => {
  await llmController.analyzeCode(req, res);
});
router.post('/prompt', async (req: Request, res: Response) => {
  await llmController.sendPrompt(req, res);
});
router.post('/chain', async (req: Request, res: Response) => {
  await llmController.executePromptChain(req, res);
});

export default router;