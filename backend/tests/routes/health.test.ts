import request from 'supertest';
import express from 'express';
import healthRouter from '../../src/routes/health.routes';
import { errorHandler, notFoundHandler } from '../../src/middleware/error';

describe('Health Check Endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health', healthRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  it('should return status ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number)
    });
  });

  it('should return 404 for invalid endpoint', async () => {
    const response = await request(app)
      .get('/api/invalid')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.error).toBe('Not Found');
  });
});
