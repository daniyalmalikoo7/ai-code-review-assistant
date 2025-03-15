// src/lib/authUtils.ts

/**
 * Checks if the user has a valid authentication token
 * @returns boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = parseJwt(token);
      const currentTime = Date.now() / 1000;
      
      if (payload && payload.exp && payload.exp > currentTime) {
        return true;
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
    
    return false;
  }
  
  /**
   * Parse a JWT token to extract its payload
   * @param token JWT token string
   * @returns Decoded token payload or null if invalid
   */
  export function parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      return null;
    }
  }
  
  /**
   * Retrieves the user information from the token
   * @returns User object from token or null if not authenticated
   */
  export function getUser(): any {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const payload = parseJwt(token);
      if (!payload) return null;
      
      return {
        userId: payload.userId,
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }
  
  /**
   * Debug function to help troubleshoot authentication issues
   * @returns boolean indicating if token is valid
   */
  export function debugAuth(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No auth token found in localStorage');
      return false;
    }
    
    console.log('Token found:', token.substring(0, 10) + '...');
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format');
        return false;
      }
      
      const payload = parseJwt(token);
      if (!payload) {
        console.error('Could not parse token payload');
        return false;
      }
      
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (expiry < now) {
        console.error('Token expired at', new Date(expiry));
        return false;
      }
      
      console.log('Token valid until', new Date(expiry));
      console.log('User info:', {
        userId: payload.userId,
        username: payload.username,
        email: payload.email
      });
      
      return true;
    } catch (err) {
      console.error('Error validating token:', err);
      return false;
    }
  }