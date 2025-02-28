import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;