// src/app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debugAuth } from '@/lib/authUtils';
import { useAuth } from '@/lib/authContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(true);
  
  useEffect(() => {
    async function handleCallback() {
      try {
        // Get token from URL parameters
        const token = searchParams.get('token');
        console.log('Received token from URL:', token ? 'yes' : 'no');
        
        if (token) {
          // Store the token in localStorage
          localStorage.setItem('auth_token', token);
          console.log('Token stored in localStorage');
          
          // Debug the token to verify it's valid
          const isValid = debugAuth();
          console.log('Token valid:', isValid);
          
          // Verify token with backend
          await checkAuthStatus();
          
          // Redirect to dashboard
          setProcessing(false);
          router.push('/dashboard');
        } else {
          // Handle error case
          console.error('No token received in callback');
          setError('Authentication failed - no token received');
          setProcessing(false);
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('Authentication failed - please try again');
        setProcessing(false);
      }
    }
    
    handleCallback();
  }, [router, searchParams, checkAuthStatus]);
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded shadow-md">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h1 className="text-xl font-semibold mt-4 mb-2">Completing Authentication...</h1>
        <p className="text-gray-600">Please wait while we complete your authentication process.</p>
      </div>
    </div>
  );
}