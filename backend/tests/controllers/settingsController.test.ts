// backend/tests/controllers/settingsController.test.ts
import { Request, Response } from 'express';
import * as settingsController from '../../src/controllers/settingsController';
import { authService } from '../../src/services/authService';
import { userService } from '../../src/services/userService';

// Mock dependencies
jest.mock('../../src/services/authService', () => ({
  authService: {
    validateGitHubToken: jest.fn()
  }
}));

jest.mock('../../src/services/userService', () => ({
  userService: {
    storeGithubToken: jest.fn()
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

describe('SettingsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request and response
    mockRequest = {
      user: { userId: 123, username: 'testuser', email: 'test@example.com' },
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getUserSettings', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Clear user from request
      mockRequest.user = undefined;
      
      // Call controller
      const result = await settingsController.getUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify response
      expect(result.status).toHaveBeenCalledWith(401);
      expect(result.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return default settings for new users', async () => {
      // Call controller
      const result = await settingsController.getUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify default settings are returned
      expect(result.status).toHaveBeenCalledWith(200);
      expect(result.json).toHaveBeenCalledWith(expect.objectContaining({
        github: expect.objectContaining({
          enabled: false,
          repositories: [],
          autoReview: true
        }),
        api: expect.any(Object),
        notifications: expect.objectContaining({
          email: false,
          slack: false,
          notifyOnCritical: true,
          notifyOnComplete: true
        })
      }));
    });
  });

  describe('updateUserSettings', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Clear user from request
      mockRequest.user = undefined;
      
      // Call controller
      const result = await settingsController.updateUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify response
      expect(result.status).toHaveBeenCalledWith(401);
      expect(result.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should validate GitHub token if provided', async () => {
      // Setup request with GitHub token
      mockRequest.body = {
        github: {
          personalAccessToken: 'test-token',
          enabled: true
        }
      };
      
      // Mock token validation to return valid=true
      (authService.validateGitHubToken as jest.Mock).mockResolvedValue({
        valid: true,
        username: 'testuser'
      });
      
      // Call controller
      const result = await settingsController.updateUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify token was validated
      expect(authService.validateGitHubToken).toHaveBeenCalledWith('test-token');
      
      // Verify token was stored
      expect(userService.storeGithubToken).toHaveBeenCalledWith(123, 'test-token');
      
      // Verify success response
      expect(result.status).toHaveBeenCalledWith(200);
      expect(result.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Settings updated successfully'
      }));
    });

    it('should return 400 if GitHub token is invalid', async () => {
      // Setup request with invalid GitHub token
      mockRequest.body = {
        github: {
          personalAccessToken: 'invalid-token',
          enabled: true
        }
      };
      
      // Mock token validation to return valid=false
      (authService.validateGitHubToken as jest.Mock).mockResolvedValue({
        valid: false
      });
      
      // Call controller
      const result = await settingsController.updateUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify error response
      expect(result.status).toHaveBeenCalledWith(400);
      expect(result.json).toHaveBeenCalledWith({ error: 'Invalid GitHub token' });
      
      // Verify token was not stored
      expect(userService.storeGithubToken).not.toHaveBeenCalled();
    });

    it('should merge new settings with existing settings', async () => {
      // Setup partial settings update
      mockRequest.body = {
        notifications: {
          email: true,
          emailAddress: 'new@example.com'
        }
      };
      
      // First, get default settings
      await settingsController.getUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Then update settings
      const result = await settingsController.updateUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify settings were merged correctly
      expect(result.status).toHaveBeenCalledWith(200);
      expect(result.json).toHaveBeenCalledWith(expect.objectContaining({
        settings: expect.objectContaining({
          github: expect.objectContaining({
            enabled: false,
            autoReview: true
          }),
          notifications: expect.objectContaining({
            email: true,
            emailAddress: 'new@example.com',
            notifyOnCritical: true,
            notifyOnComplete: true
          })
        })
      }));
    });
  });

  describe('deleteUserSettings', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Clear user from request
      mockRequest.user = undefined;
      
      // Call controller
      const result = await settingsController.deleteUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify response
      expect(result.status).toHaveBeenCalledWith(401);
      expect(result.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should delete user settings', async () => {
      // First, set some settings
      mockRequest.body = {
        github: {
          enabled: true,
          repositories: ['test/repo']
        }
      };
      
      await settingsController.updateUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Then delete settings
      const result = await settingsController.deleteUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      // Verify success response
      expect(result.status).toHaveBeenCalledWith(200);
      expect(result.json).toHaveBeenCalledWith({
        success: true,
        message: 'Settings deleted successfully'
      });
      
      // Verify settings were deleted by getting them again (should return default settings)
      const getResult = await settingsController.getUserSettings(
        mockRequest as Request, 
        mockResponse as Response
      );
      
      expect(getResult.json).toHaveBeenCalledWith(expect.objectContaining({
        github: expect.objectContaining({
          enabled: false,
          repositories: [],
          autoReview: true
        })
      }));
    });
  });
});