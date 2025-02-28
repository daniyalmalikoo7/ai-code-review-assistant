// backend/tests/controllers/authController.test.ts
import { Request, Response } from 'express';
import * as authController from '../../src/controllers/authController';
import { authService } from '../../src/services/authService';

// Mock dependencies
jest.mock('../../src/services/authService', () => ({
  authService: {
    getAuthorizationUrl: jest.fn(),
    exchangeCodeForToken: jest.fn(),
    getGitHubUser: jest.fn(),
    generateToken: jest.fn(),
    validateGitHubToken: jest.fn()
  }
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}));

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request and response
    mockRequest = {
      query: {},
      body: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn()
    };

    // Set environment variables for tests
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.FRONTEND_URL;
  });

  describe('initiateOAuth', () => {
    it('should redirect to GitHub authorization URL', () => {
      // Mock authorization URL
      const mockAuthUrl = 'https://github.com/login/oauth/authorize?client_id=abc';
      (authService.getAuthorizationUrl as jest.Mock).mockReturnValue(mockAuthUrl);
      
      // Call the controller
      authController.initiateOAuth(mockRequest as Request, mockResponse as Response);
      
      // Verify redirect
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockAuthUrl);
    });

    it('should handle errors and return 500', () => {
      // Mock error
      (authService.getAuthorizationUrl as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to generate URL');
      });
      
      // Call the controller
      authController.initiateOAuth(mockRequest as Request, mockResponse as Response);
      
      // Verify error response
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to initiate OAuth flow' });
    });
  });

  describe('handleOAuthCallback', () => {
    it('should return 400 if code is missing', async () => {
      // Call the controller without a code
      await authController.handleOAuthCallback(mockRequest as Request, mockResponse as Response);
      
      // Verify error response
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Missing authorization code' });
    });

    it('should exchange code for token and redirect to frontend with JWT', async () => {
      // Setup mock request with code
      mockRequest.query = { code: 'test-code' };
      
      // Mock services
      const mockAccessToken = 'github-access-token';
      const mockUser = { id: 123, login: 'testuser', email: 'test@example.com', name: 'Test User', avatar_url: '' };
      const mockJwtToken = 'jwt-token';
      
      (authService.exchangeCodeForToken as jest.Mock).mockResolvedValue(mockAccessToken);
      (authService.getGitHubUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateToken as jest.Mock).mockReturnValue(mockJwtToken);
      
      // Call the controller
      await authController.handleOAuthCallback(mockRequest as Request, mockResponse as Response);
      
      // Verify redirect to frontend with token
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/callback?token=jwt-token'
      );
      
      // Verify service calls
      expect(authService.exchangeCodeForToken).toHaveBeenCalledWith('test-code');
      expect(authService.getGitHubUser).toHaveBeenCalledWith(mockAccessToken);
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors and redirect to error page', async () => {
      // Setup mock request with code
      mockRequest.query = { code: 'test-code' };
      
      // Mock error in token exchange
      (authService.exchangeCodeForToken as jest.Mock).mockRejectedValue(
        new Error('Invalid code')
      );
      
      // Call the controller
      await authController.handleOAuthCallback(mockRequest as Request, mockResponse as Response);
      
      // Verify redirect to error page
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/error?error=oauth_failed'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return 401 if user is not authenticated', () => {
      // Call the controller without a user
      const result = authController.getCurrentUser(mockRequest as Request, mockResponse as Response);
      
      // Verify error response
      expect(result.status).toHaveBeenCalledWith(401);
      expect(result.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return user data if authenticated', () => {
      // Setup mock authenticated request
      const mockUser = { userId: 123, username: 'testuser', email: 'test@example.com' };
      mockRequest.user = mockUser;
      
      // Call the controller
      const result = authController.getCurrentUser(mockRequest as Request, mockResponse as Response);
      
      // Verify success response
      expect(result.status).toHaveBeenCalledWith(200);
      expect(result.json).toHaveBeenCalledWith({ user: mockUser });
    });
  });

  describe('validateGitHubToken', () => {
    it('should return 400 if token is missing', async () => {
      // Call the controller without a token
      const result = await authController.validateGitHubToken(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify error response
      expect(result.status).toHaveBeenCalledWith(400);
      expect(result.json).toHaveBeenCalledWith({ error: 'Token is required' });
    });

    it('should validate the token and return the result', async () => {
      // Setup mock request with token
      mockRequest.body = { token: 'test-token' };
      
      // Mock validation result
      const mockResult = { valid: true, username: 'testuser' };
      (authService.validateGitHubToken as jest.Mock).mockResolvedValue(mockResult);
      
      // Call the controller
      const result = await authController.validateGitHubToken(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify success response
      expect(result.status).toHaveBeenCalledWith(200);
      expect(result.json).toHaveBeenCalledWith(mockResult);
      expect(authService.validateGitHubToken).toHaveBeenCalledWith('test-token');
    });

    it('should handle errors and return 500', async () => {
      // Setup mock request with token
      mockRequest.body = { token: 'test-token' };
      
      // Mock validation error
      (authService.validateGitHubToken as jest.Mock).mockRejectedValue(
        new Error('Validation failed')
      );
      
      // Call the controller
      const result = await authController.validateGitHubToken(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify error response
      expect(result.status).toHaveBeenCalledWith(500);
      expect(result.json).toHaveBeenCalledWith({ error: 'Failed to validate token' });
    });
  });
});