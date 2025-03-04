import { Request, Response, NextFunction } from 'express';

// Mock authentication middleware that adds a test user to the request
export const mockAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Add test user to request
  req.user = {
    userId: 123,
    username: 'testuser',
    email: 'test@example.com'
  };
  
  // Continue to the next middleware/route handler
  next();
};

// Create the jest mock function
export const authenticate = jest.fn(mockAuthenticate);