// src/lib/apiClient.ts
import { debugAuth } from './authUtils';

// Get backend URL from environment variables or fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
console.log('Using backend URL:', BACKEND_URL);

/**
 * API client for communicating with the backend
 */
export const apiClient = {
  // Helper method to get the auth token
  getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem("auth_token");
  },

  // Helper method to create headers with auth token
  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log('Adding token to request:', `Bearer ${token.substring(0, 10)}...`); // Log for debugging
    } else {
      console.warn('No auth token found in localStorage');
    }
    
    return headers;
  },

  // Helper method to handle API responses
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Log the full response for debugging
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
      });
      
      // Handle 401 unauthorized errors
      if (response.status === 401 && typeof window !== 'undefined') {
        console.error("Authentication required - redirecting to login");
        localStorage.removeItem("auth_token");
        
        // If we're not already on the homepage, redirect there
        if (window.location.pathname !== '/') {
          window.location.href = "/";
        }
        
        throw new Error("Authentication required");
      }
      
      // For other errors, try to get the error message from the response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  // API requests with authentication
  async get<T>(url: string): Promise<T> {
    // Check auth status before making request
    debugAuth();
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<T>(response);
  },
  
  async post<T>(url: string, data: any): Promise<T> {
    // Check auth status before making request
    debugAuth();
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<T>(response);
  },
  
  async put<T>(url: string, data: any): Promise<T> {
    // Check auth status before making request
    debugAuth();
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<T>(response);
  },
  
  async delete<T>(url: string): Promise<T> {
    // Check auth status before making request
    debugAuth();
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<T>(response);
  },

  // Domain-specific methods
  async getReviews() {
    return this.get('/api/code-analyzer/reviews');
  },
  
  async getReviewById(id: string | number) {
    return this.get(`/api/code-analyzer/reviews/${id}`);
  },
  
  async analyzeCode(request: any) {
    return this.post('/api/code-analyzer/analyze-pr-with-feedback', request);
  },
  
  async getSettings() {
    return this.get('/api/settings');
  },
  
  async saveSettings(settings: any) {
    return this.post('/api/settings', settings);
  },
  
  async validateGithubToken(token: string) {
    return this.post('/api/auth/validate-github-token', { token });
  },
  
  async getCurrentUser() {
    return this.get('/api/auth/me');
  }
};

// Helper functions for UI components
export function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case "Critical":
      return "🚨";
    case "Warning":
      return "⚠️";
    case "Suggestion":
      return "💡";
    default:
      return "";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "Critical":
      return "text-red-600 bg-red-100 border-red-200";
    case "Warning":
      return "text-amber-600 bg-amber-100 border-amber-200";
    case "Suggestion":
      return "text-blue-600 bg-blue-100 border-blue-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-200";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-amber-500";
  if (score >= 50) return "text-orange-500";
  return "text-red-600";
}