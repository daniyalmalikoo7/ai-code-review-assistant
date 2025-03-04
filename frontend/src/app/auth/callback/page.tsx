'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get token from URL parameters
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token in localStorage or a secure cookie
      localStorage.setItem('auth_token', token);
      
      // Redirect to dashboard or home page
      router.push('/dashboard');
    } else {
      // Handle error case
      router.push('/auth/error');
    }
  }, [router, searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Authenticating...</h1>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}