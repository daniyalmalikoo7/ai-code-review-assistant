'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('Authentication failed');
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  useEffect(() => {
    // Extract error information from query parameters
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      switch (error) {
        case 'access_denied':
          setErrorMessage('Access Denied');
          setErrorDetails('You denied access to your GitHub account.');
          break;
        case 'oauth_failed':
          setErrorMessage('OAuth Authentication Failed');
          setErrorDetails('There was an issue authenticating with GitHub.');
          break;
        case 'token_expired':
          setErrorMessage('Session Expired');
          setErrorDetails('Your session has expired. Please log in again.');
          break;
        case 'invalid_token':
          setErrorMessage('Invalid Token');
          setErrorDetails('Your authentication token is invalid.');
          break;
        default:
          setErrorMessage('Authentication Error');
          setErrorDetails(errorDescription || 'An error occurred during authentication.');
      }
    }
  }, [searchParams]);

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    // Redirect to home page
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{errorMessage}</h2>
          <p className="text-gray-600 mb-6">{errorDetails}</p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleReturnHome}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return Home
            </button>
            
            <button
              onClick={handleTryAgain}
              className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}