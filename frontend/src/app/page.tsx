// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  prId: number;
  prTitle: string;
  repository: string;
  score: number;
}

export default function Home() {
  // const router = useRouter(); 
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, we'll just use mock data instead of actual API call
    const loadReviews = async () => {
      // In a real app: const response = await fetch('/api/reviews?limit=3');
      
      // Mock data
      const mockReviews = [
        { id: '1', prId: 123, prTitle: 'Add user authentication', repository: 'org/repo', score: 75 },
        { id: '2', prId: 124, prTitle: 'Refactor database queries', repository: 'org/repo', score: 92 },
        { id: '3', prId: 125, prTitle: 'Fix security issues', repository: 'org/other-repo', score: 60 },
      ];
      
      setTimeout(() => {
        setRecentReviews(mockReviews);
        setLoading(false);
      }, 500);
    };
    
    loadReviews();
  }, []);

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
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              </div>
              <div className="ml-3 inline-flex">
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                >
                  Configure Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Code Reviews</h2>
            {loading ? (
              <div className="mt-4 bg-white shadow rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="mt-4 bg-white shadow rounded-lg divide-y divide-gray-200">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-gray-50">
                    <Link href={`/reviews/${review.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            PR #{review.prId}: {review.prTitle}
                          </h3>
                          <p className="text-sm text-gray-500">{review.repository}</p>
                        </div>
                        <div className={`text-xl font-bold ${
                          review.score >= 90 ? 'text-green-600' :
                          review.score >= 70 ? 'text-amber-500' :
                          review.score >= 50 ? 'text-orange-500' : 'text-red-600'
                        }`}>
                          {review.score}/100
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/reviews"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all reviews →
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <div className="mt-4 bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h3 className="font-medium text-gray-900">Trigger a Manual Review</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Analyze a pull request to get actionable feedback
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h3 className="font-medium text-gray-900">Configure GitHub Integration</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Set up automatic PR reviews with GitHub webhooks
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                  <h3 className="font-medium text-gray-900">Notification Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure how you receive alerts about code issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            AI-Powered Code Review Assistant © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}