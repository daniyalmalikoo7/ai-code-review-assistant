// backend/src/models/user.model.ts
import { createLogger } from '../utils/logger';

const logger = createLogger('UserModel');

export interface User {
  id: number;
  githubId: number;
  username: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  githubToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory user store (for demo purposes only)
 * In a real application, you would use a database like MongoDB, PostgreSQL, etc.
 */
class UserStore {
  private users: Map<number, User> = new Map();
  
  /**
   * Find a user by GitHub ID
   */
  findByGithubId(githubId: number): User | undefined {
    for (const user of this.users.values()) {
      if (user.githubId === githubId) {
        return user;
      }
    }
    return undefined;
  }
  
  /**
   * Find a user by ID
   */
  findById(id: number): User | undefined {
    return this.users.get(id);
  }
  
  /**
   * Find a user by username
   */
  findByUsername(username: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  /**
   * Create or update a user
   */
  upsertUser(userData: Partial<User> & { githubId: number }): User {
    // Check if user already exists
    const existingUser = this.findByGithubId(userData.githubId);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date()
      };
      
      this.users.set(existingUser.id, updatedUser);
      logger.info('Updated user', { id: updatedUser.id, username: updatedUser.username });
      return updatedUser;
    } else {
      // Create new user
      const newId = this.getNextId();
      const newUser: User = {
        id: newId,
        githubId: userData.githubId,
        username: userData.username || `user_${newId}`,
        email: userData.email || '',
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        githubToken: userData.githubToken,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.users.set(newId, newUser);
      logger.info('Created new user', { id: newUser.id, username: newUser.username });
      return newUser;
    }
  }
  
  /**
   * Remove a user by ID
   */
  removeUser(id: number): boolean {
    const result = this.users.delete(id);
    if (result) {
      logger.info('Removed user', { id });
    }
    return result;
  }
  
  /**
   * Get all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
  
  /**
   * Helper to generate the next user ID
   */
  private getNextId(): number {
    const maxId = Math.max(0, ...Array.from(this.users.keys()));
    return maxId + 1;
  }
}

// Export a singleton instance
export const userStore = new UserStore();