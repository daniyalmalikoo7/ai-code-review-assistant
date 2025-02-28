// backend/src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from './utils/logger';
import llmRoutes from './routes/llmRoutes';
import healthRoutes from './routes/health.routes';
import codeAnalyzerRoutes from './routes/codeAnalyzerRoutes';
import authRoutes from './routes/authRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { errorHandler, notFoundHandler } from './middleware/error';
import webhookRoutes from './routes/webhookRoutes';
import { authenticate } from './middleware/auth.middleware';

const app = express();
const logger = createLogger('App');

// Middleware
app.use(helmet());
app.use(cors({
  // Allow credentials (cookies) to be sent
  credentials: true,
  // Configure allowed origins
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`, { 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Public routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Webhook routes (protected by webhook-specific authentication)
app.use('/api/webhooks', webhookRoutes);

// Protected routes (require authentication)
app.use('/api/llm', authenticate, llmRoutes);
app.use('/api/code-analyzer', authenticate, codeAnalyzerRoutes);
app.use('/api/settings', authenticate, settingsRoutes);

// Handle 404s
app.use(notFoundHandler);

// Handle errors
app.use(errorHandler);

export default app;