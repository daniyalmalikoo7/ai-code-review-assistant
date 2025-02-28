// backend/src/controllers/settingsController.ts
import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

const logger = createLogger('SettingsController');

// Types for settings
export interface UserGitHubSettings {
  personalAccessToken?: string;
  webhookSecret?: string;
  enabled: boolean;
  repositories: string[];
  autoReview: boolean;
}

export interface UserApiSettings {
  apiKey?: string;
}

export interface UserNotificationSettings {
  email: boolean;
  emailAddress?: string;
  slack: boolean;
  slackWebhook?: string;
  notifyOnCritical: boolean;
  notifyOnComplete: boolean;
}

export interface UserSettings {
  github: UserGitHubSettings;
  api: UserApiSettings;
  notifications: UserNotificationSettings;
}

// In-memory storage for user settings (in a real app, this would be in a database)
const userSettings = new Map<number, UserSettings>();

/**
 * Get user settings
 */
export const getUserSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;
    
    // Get settings from storage or return default settings
    const settings = userSettings.get(userId) || getDefaultSettings();
    
    return res.status(200).json(settings);
  } catch (error) {
    logger.error('Error getting user settings', { error });
    return res.status(500).json({ error: 'Failed to get user settings' });
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;
    const newSettings: UserSettings = req.body;
    
    // Validate GitHub token if provided
    if (newSettings.github?.personalAccessToken) {
      const tokenValidation = await authService.validateGitHubToken(
        newSettings.github.personalAccessToken
      );
      
      if (!tokenValidation.valid) {
        return res.status(400).json({ error: 'Invalid GitHub token' });
      }
      
      // Store the validated token in the user's profile
      userService.storeGithubToken(userId, newSettings.github.personalAccessToken);
    }
    
    // Merge with existing settings or create new settings
    const existingSettings = userSettings.get(userId) || getDefaultSettings();
    const mergedSettings = {
      ...existingSettings,
      ...newSettings,
      // Deep merge each settings section
      github: { ...existingSettings.github, ...newSettings.github },
      api: { ...existingSettings.api, ...newSettings.api },
      notifications: { ...existingSettings.notifications, ...newSettings.notifications }
    };
    
    // Save to storage
    userSettings.set(userId, mergedSettings);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: mergedSettings
    });
  } catch (error) {
    logger.error('Error updating user settings', { error });
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};

/**
 * Delete user settings
 */
export const deleteUserSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.userId;
    
    // Remove settings from storage
    userSettings.delete(userId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Settings deleted successfully' 
    });
  } catch (error) {
    logger.error('Error deleting user settings', { error });
    return res.status(500).json({ error: 'Failed to delete settings' });
  }
};

/**
 * Get default settings for a new user
 */
function getDefaultSettings(): UserSettings {
  return {
    github: {
      enabled: false,
      repositories: [],
      autoReview: true
    },
    api: {},
    notifications: {
      email: false,
      slack: false,
      notifyOnCritical: true,
      notifyOnComplete: true
    }
  };
}