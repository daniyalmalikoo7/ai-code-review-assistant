// backend/tests/services/authService.test.ts
import { AuthService, GitHubUser } from '../../src/services/authService';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

// Mock dependencies
jest.mock('node-fetch');
jest.mock('jsonwebtoken');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup environment variables
    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
    
    // Create a new instance of AuthService
    authService = new AuthService();
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.JWT_SECRET;
    delete process.env.REDIRECT_URI;
  });

  describe('getAuthorizationUrl', () => {
    it('should generate the correct GitHub OAuth URL', () => {
      const url = authService.getAuthorizationUrl();
      
      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http://localhost:3000/api/auth/callback');
      expect(url).toContain('scope=read:user user:email repo');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for access token successfully', async () => {
      // Mock fetch to return a successful response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: 'test-access-token' })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const token = await authService.exchangeCodeForToken('test-code');
      
      expect(token).toBe('test-access-token');
      expect(fetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-code')
        })
      );
    });

    it('should throw an error if GitHub response has an error', async () => {
      // Mock fetch to return an error response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ error: 'bad_verification_code' })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await expect(authService.exchangeCodeForToken('invalid-code'))
        .rejects
        .toThrow('bad_verification_code');
    });

    it('should throw an error if fetch fails', async () => {
      // Mock fetch to throw an error
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      await expect(authService.exchangeCodeForToken('test-code'))
        .rejects
        .toThrow('Failed to exchange code for token');
    });
  });

  describe('getGitHubUser', () => {
    it('should fetch GitHub user profile successfully', async () => {
      // Mock user data
      const mockUserData: GitHubUser = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://github.com/avatar.png'
      };
      
      // Mock user API response
      const mockUserResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData)
      };
      
      // Setup fetch to return the mock response
      (fetch as jest.Mock).mockResolvedValueOnce(mockUserResponse);
      
      const user = await authService.getGitHubUser('test-token');
      
      expect(user).toEqual(mockUserData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token test-token'
          })
        })
      );
    });

    it('should fetch user emails if primary email is not available', async () => {
      // Mock user without email
      const mockUserData = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.png'
      };
      
      // Mock email data
      const mockEmailData = [
        { email: 'primary@example.com', primary: true, verified: true },
        { email: 'secondary@example.com', primary: false, verified: true }
      ];
      
      // Mock API responses
      const mockUserResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData)
      };
      
      const mockEmailResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockEmailData)
      };
      
      // Setup fetch to return the mock responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce(mockUserResponse)
        .mockResolvedValueOnce(mockEmailResponse);
      
      const user = await authService.getGitHubUser('test-token');
      
      expect(user.email).toBe('primary@example.com');
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.github.com/user/emails',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token test-token'
          })
        })
      );
    });

    it('should throw an error if GitHub API fails', async () => {
      // Mock API failure
      const mockResponse = {
        ok: false,
        status: 401
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      await expect(authService.getGitHubUser('invalid-token'))
        .rejects
        .toThrow('GitHub API error: 401');
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token with correct payload', () => {
      // Mock user data
      const mockUser: GitHubUser = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://github.com/avatar.png'
      };
      
      // Mock JWT sign
      (jwt.sign as jest.Mock).mockReturnValue('test-jwt-token');
      
      const token = authService.generateToken(mockUser);
      
      expect(token).toBe('test-jwt-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 12345,
          username: 'testuser',
          email: 'test@example.com'
        },
        'test-jwt-secret',
        { expiresIn: '24h' }
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return token payload', () => {
      // Mock payload
      const mockPayload = {
        userId: 12345,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      // Mock JWT verify
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      
      const payload = authService.verifyToken('test-token');
      
      expect(payload).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith('test-token', 'test-jwt-secret');
    });

    it('should throw an error if token verification fails', () => {
      // Mock JWT verify to fail
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });
      
      expect(() => authService.verifyToken('invalid-token'))
        .toThrow('Invalid token');
    });
  });

  describe('validateGitHubToken', () => {
    it('should return valid=true with username for valid token', async () => {
      // Mock user API response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ login: 'testuser' })
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await authService.validateGitHubToken('valid-token');
      
      expect(result).toEqual({ valid: true, username: 'testuser' });
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token valid-token'
          })
        })
      );
    });

    it('should return valid=false for invalid token', async () => {
      // Mock API failure
      const mockResponse = {
        ok: false,
        status: 401
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await authService.validateGitHubToken('invalid-token');
      
      expect(result).toEqual({ valid: false });
    });

    it('should return valid=false if fetch fails', async () => {
      // Mock fetch error
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const result = await authService.validateGitHubToken('test-token');
      
      expect(result).toEqual({ valid: false });
    });
  });
});