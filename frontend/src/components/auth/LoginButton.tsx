// src/components/auth/LoginButton.tsx
'use client';

import React from 'react';
import { useAuth } from '../../lib/authContext';

interface LoginButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '', 
  variant = 'primary' 
}) => {
  const { isAuthenticated, loading, login, logout } = useAuth();

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center justify-center px-5 py-3 border text-base font-medium rounded-md";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} border-transparent text-white bg-blue-600 hover:bg-blue-700 ${className}`;
      case 'secondary':
        return `${baseClasses} border-transparent text-blue-600 bg-blue-100 hover:bg-blue-200 ${className}`;
      case 'outline':
        return `${baseClasses} border-blue-600 text-blue-600 bg-white hover:bg-gray-50 ${className}`;
      default:
        return `${baseClasses} border-transparent text-white bg-blue-600 hover:bg-blue-700 ${className}`;
    }
  };

  if (loading) {
    return (
      <button 
        disabled
        className={getButtonClasses()}
      >
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </button>
    );
  }

  return isAuthenticated ? (
    <button 
      onClick={logout}
      className={getButtonClasses()}
    >
      Logout
    </button>
  ) : (
    <button 
      onClick={login}
      className={getButtonClasses()}
    >
      Login with GitHub
    </button>
  );
};

export default LoginButton;