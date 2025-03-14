// src/lib/api.ts
import { ReviewSummary, DetailedReview, AnalysisRequest } from '@/types/review';
import { UserSettings } from '@/types/settings';

// Default backend URL - in production this would be read from environment variables
const DEFAULT_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';


/**
 * API client for communicating with the backend
 */
export const apiClient = {
  // Get all reviews
  async getReviews(): Promise<ReviewSummary[]> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${DEFAULT_BACKEND_URL}/api/code-analyzer/reviews`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Return empty array as fallback for now
      return [];
    }
  },

    // Get a specific review by ID
    async getReviewById(id: string | number): Promise<DetailedReview> {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${DEFAULT_BACKEND_URL}/api/code-analyzer/reviews/${id}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch review ${id}: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error(`Error fetching review ${id}:`, error);
        throw error;
      }
    },
  
 // Trigger a manual code analysis
 async analyzeCode(request: AnalysisRequest): Promise<{ id: string | number }> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${DEFAULT_BACKEND_URL}/api/code-analyzer/analyze-pr`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate analysis: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
},
  
  // Save user settings
  async saveSettings(settings: UserSettings): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${DEFAULT_BACKEND_URL}/api/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },
  
 // Get user settings
 async getSettings(): Promise<UserSettings> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${DEFAULT_BACKEND_URL}/api/settings`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings as fallback
    return {
      github: {
        personalAccessToken: '',
        webhookSecret: '',
        enabled: false,
        repositories: [],
        autoReview: true
      },
      api: {
        backendUrl: DEFAULT_BACKEND_URL,
        apiKey: ''
      },
      notifications: {
        email: false,
        emailAddress: '',
        slack: false,
        slackWebhook: '',
        notifyOnCritical: true,
        notifyOnComplete: true
      }
    };
  }
},
  
  // Validate GitHub token
  async validateGithubToken(token: string): Promise<{ valid: boolean, username?: string }> {
    try {
      const response = await fetch(`${DEFAULT_BACKEND_URL}/api/auth/validate-github-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        return { valid: false };
      }
      
      return response.json();
    } catch (error) {
      console.error('Error validating GitHub token:', error);
      return { valid: false };
    }
  },
  
  // Login with GitHub
  loginWithGitHub(): void {
    window.location.href = `${DEFAULT_BACKEND_URL}/api/auth/github`;
  }
};

/**
 * Helper function to get the severity emoji for an issue
 */
export function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'Critical':
      return '🚨';
    case 'Warning':
      return '⚠️';
    case 'Suggestion':
      return '💡';
    default:
      return '';
  }
}

/**
 * Helper function to get the color for a severity level
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'Warning':
      return 'text-amber-600 bg-amber-100 border-amber-200';
    case 'Suggestion':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

/**
 * Helper function to get the color for a score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-amber-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-red-600';
}