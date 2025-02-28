// backend/tests/middleware/auth.middleware.test.ts
import { Request, Response, NextFunction } from 'express';
import { authenticate, authenticateWebhook } from '../../src/middleware/auth.middleware';
import { authService } from '../../src/services/authService';

// Mock dependencies
jest.mock('../../src/services/authService', () => ({
  authService: {
    verifyToken: jest.fn()
  }
}));

jest.mock('../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request, response, and next function
    mockRequest = {
      headers: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    nextFunction = jest.fn();
  });

  describe('authenticate middleware', () => {
    it('should return 401 if no authorization header is present', () => {
      // Execute the middleware
      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid authorization format', () => {
      // Setup mock request with invalid authorization header
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };
      
      // Execute the middleware
      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Invalid authorization format. Use: Bearer <token>' 
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', () => {
      // Setup mock request with valid authorization header
      mockRequest.headers = {
        authorization: 'Bearer invalidToken'
      };
      
      // Setup mock token verification to fail
      (authService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Execute the middleware
      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should add user data to request and call next() for valid tokens', () => {
      // Setup mock request with valid authorization header
      mockRequest.headers = {
        authorization: 'Bearer validToken'
      };
      
      // Setup mock token verification to succeed
      const mockUser = { userId: 123, username: 'testuser', email: 'test@example.com' };
      (authService.verifyToken as jest.Mock).mockReturnValue(mockUser);
      
      // Execute the middleware
      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // Verify that user was added to request and next() was called
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authenticateWebhook middleware', () => {
    beforeEach(() => {
      // Mock the webhook validator
      jest.mock('../../src/middleware/githubWebhookValidator', () => ({
        validateGitHubWebhook: jest.fn().mockImplementation((_req, _res, next) => next())
      }));
    });

    it('should return 400 if required headers are missing', () => {
      // Execute the middleware
      authenticateWebhook(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // Verify response
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Missing required GitHub webhook headers' 
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should bypass validation in development mode if flag is set', () => {
      // Setup environment variables
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_WEBHOOK_VALIDATION = 'true';
      
      // Setup mock request with headers
      mockRequest.headers = {
        'x-hub-signature-256': 'signature',
        'x-github-event': 'push',
        'x-github-delivery': 'delivery-id'
      };
      
      // Execute the middleware
      authenticateWebhook(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // Verify that next() was called without validation
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      
      // Reset environment variables
      delete process.env.NODE_ENV;
      delete process.env.BYPASS_WEBHOOK_VALIDATION;
    });
  });
});