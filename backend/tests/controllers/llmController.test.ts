import request from 'supertest';
import express, { Request, Response } from 'express';
import { sendPrompt, analyzeCode } from '../../src/controllers/llmController';

// Mock LLMService
jest.mock('../../src/services/llmService', () => ({
  sendPrompt: jest.fn().mockImplementation(async (prompt) => {
    return `Mock response for: ${prompt}`;
  }),
  analyzeCode: jest.fn().mockImplementation(async (code, context) => {
    return `Analysis of code: ${code} with context: ${context || 'none'}`;
  }),
  executePromptChain: jest.fn()
}));

describe('LLM Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/llm/prompt', async (req: Request, res: Response) => {
      await sendPrompt(req, res);
    });
    app.post('/api/llm/analyze-code', async (req: Request, res: Response) => {
      await analyzeCode(req, res);
    });
  });

  describe('POST /api/llm/prompt', () => {
    it('should process a prompt and return a response', async () => {
      const response = await request(app)
        .post('/api/llm/prompt')
        .send({ prompt: 'Test prompt' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.response).toContain('Mock response for: Test prompt');
    });

    it('should return 400 if prompt is missing', async () => {
      const response = await request(app)
        .post('/api/llm/prompt')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toBe('Prompt is required');
    });
  });

  describe('POST /api/llm/analyze-code', () => {
    it('should analyze code and return a response', async () => {
      const response = await request(app)
        .post('/api/llm/analyze-code')
        .send({ code: 'const x = 1;', context: 'Test context' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.analysis).toContain('Analysis of code: const x = 1;');
    });

    it('should return 400 if code is missing', async () => {
      const response = await request(app)
        .post('/api/llm/analyze-code')
        .send({ context: 'Test context' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toBe('Code is required');
    });
  });
});
