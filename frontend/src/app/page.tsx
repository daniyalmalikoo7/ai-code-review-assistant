// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Home() {
  const { isAuthenticated, loading, login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Handle client-side hydration
    setMounted(true);
    
    // Redirect to dashboard if already authenticated
    if (mounted && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, mounted]);

  // Until component is mounted, show nothing to avoid hydration errors
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              AI-Powered Code Review Assistant
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Automated code quality checks to improve your codebase
            </p>
            <div className="mt-10 flex justify-center">
              {loading ? (
                <div className="inline-flex rounded-md shadow">
                  <button
                    disabled
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 opacity-70"
                  >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </button>
                </div>
              ) : isAuthenticated ? (
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="inline-flex rounded-md shadow">
                  <button
                    onClick={login}
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Login with GitHub
                  </button>
                </div>
              )}
              
              <div className="ml-3 inline-flex">
                <a
                  href="https://github.com/your-username/ai-code-review-assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Improve Your Code Quality
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Our AI-powered code review assistant helps you identify issues in your code before they cause problems.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Security Analysis</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Identify security vulnerabilities, including SQL injection, XSS, and insecure practices.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Performance Optimization</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Detect performance bottlenecks and suggest optimizations to make your code faster.
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">Code Quality</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Improve code maintainability with insights on style, architecture, and best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            AI-Powered Code Review Assistant © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}