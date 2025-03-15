// src/lib/authContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define types for our auth context
interface User {
  userId: number;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// JWT token decoder utility
function decodeJWT(token: string): any {
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
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Backend URL from environment variable
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // Function to handle login
  const login = () => {
    // Redirect to GitHub auth endpoint on backend
    const authUrl = `${backendUrl}/api/auth/github`;
    console.log('Redirecting to:', authUrl);
    window.location.href = authUrl;
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  // Utility function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    const decodedToken = decodeJWT(token);
    if (!decodedToken || !decodedToken.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  };

  // Function to check auth status
  const checkAuthStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return false;
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token is expired, logging out');
      logout();
      return false;
    }
    
    try {
      // Validate the token with the backend
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        console.error('Failed to validate token with backend');
        logout();
        return false;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Protect routes that require authentication
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/reviews', '/settings'];
    const publicRoutes = ['/', '/auth/callback', '/auth/error'];
    
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some(route => 
        pathname === route || pathname?.startsWith(`${route}/`)
      );
      
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname?.startsWith(`${route}/`)
      );
      
      if (isProtectedRoute && !isAuthenticated) {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}