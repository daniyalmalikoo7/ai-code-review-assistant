// backend/src/services/userService.ts
import { User, userStore } from '../models/user.model';
import { GitHubUser } from './authService';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserService');

/**
 * Service for managing users
 */
export class UserService {
  /**
   * Create or update a user from GitHub profile data
   */
  createOrUpdateUserFromGithub(
    githubUser: GitHubUser, 
    githubToken?: string
  ): User {
    logger.info('Creating or updating user from GitHub', { username: githubUser.login });
    
    return userStore.upsertUser({
      githubId: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      name: githubUser.name,
      avatarUrl: githubUser.avatar_url,
      githubToken
    });
  }
  
  /**
   * Find a user by ID
   */
  findUserById(id: number): User | undefined {
    return userStore.findById(id);
  }
  
  /**
   * Find a user by GitHub ID
   */
  findUserByGithubId(githubId: number): User | undefined {
    return userStore.findByGithubId(githubId);
  }
  
  /**
   * Find a user by username
   */
  findUserByUsername(username: string): User | undefined {
    return userStore.findByUsername(username);
  }
  
  /**
   * Get all users
   */
  getAllUsers(): User[] {
    return userStore.getAllUsers();
  }
  
  /**
   * Store GitHub token for a user
   */
  storeGithubToken(userId: number, token: string): User | undefined {
    const user = userStore.findById(userId);
    
    if (!user) {
      logger.warn('User not found when storing GitHub token', { userId });
      return undefined;
    }
    
    const updatedUser = userStore.upsertUser({
      ...user,
      githubId: user.githubId,
      githubToken: token
    });
    
    logger.info('Stored GitHub token for user', { userId });
    return updatedUser;
  }
  
  /**
   * Remove a user by ID
   */
  removeUser(id: number): boolean {
    return userStore.removeUser(id);
  }
}

// Export a singleton instance
export const userService = new UserService();

export default userService;