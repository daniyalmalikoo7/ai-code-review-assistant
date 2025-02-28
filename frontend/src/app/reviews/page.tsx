// src/app/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { ReviewSummary } from '@/types/review';
import {  getScoreColor } from '@/lib/api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    repository: 'all',
    author: 'all'
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we would fetch from the API
        // const data = await apiClient.getReviews();
        
        // For demo purposes, using mock data
        const mockReviews: ReviewSummary[] = [
          {
            id: '1',
            prId: 123,
            prTitle: 'Add user authentication feature',
            repository: 'org/repo',
            branch: 'feature/auth',
            author: 'johndoe',
            status: 'completed',
            createdAt: '2023-06-01T12:00:00Z',
            completedAt: '2023-06-01T12:05:30Z',
            overallScore: 75,
            issueStats: {
              critical: 2,
              warning: 5,
              suggestion: 10,
              total: 17
            }
          },
          {
            id: '2',
            prId: 124,
            prTitle: 'Refactor database queries',
            repository: 'org/repo',
            branch: 'feature/db-refactor',
            author: 'janedoe',
            status: 'pending',
            createdAt: '2023-06-02T10:30:00Z',
            overallScore: 0,
            issueStats: {
              critical: 0,
              warning: 0,
              suggestion: 0,
              total: 0
            }
          },
          {
            id: '3',
            prId: 125,
            prTitle: 'Update dependencies and fix security vulnerabilities',
            repository: 'org/other-repo',
            branch: 'fix/security',
            author: 'securityteam',
            status: 'completed',
            createdAt: '2023-06-03T09:15:00Z',
            completedAt: '2023-06-03T09:20:12Z',
            overallScore: 92,
            issueStats: {
              critical: 0,
              warning: 3,
              suggestion: 5,
              total: 8
            }
          },
          {
            id: '4',
            prId: 126,
            prTitle: 'Add new API endpoints for user profiles',
            repository: 'org/api-service',
            branch: 'feature/user-profiles',
            author: 'apiteam',
            status: 'failed',
            createdAt: '2023-06-04T14:20:00Z',
            overallScore: 0,
            issueStats: {
              critical: 0,
              warning: 0,
              suggestion: 0,
              total: 0
            }
          },
          {
            id: '5',
            prId: 127,
            prTitle: 'Implement notification system',
            repository: 'org/repo',
            branch: 'feature/notifications',
            author: 'johndoe',
            status: 'completed',
            createdAt: '2023-06-05T08:45:00Z',
            completedAt: '2023-06-05T08:50:23Z',
            overallScore: 85,
            issueStats: {
              critical: 0,
              warning: 2,
              suggestion: 7,
              total: 9
            }
          }
        ];
        
        setReviews(mockReviews);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);
  
  // Filter reviews based on current filter settings
  const filteredReviews = reviews.filter(review => {
    if (filter.status !== 'all' && review.status !== filter.status) {
      return false;
    }
    if (filter.repository !== 'all' && review.repository !== filter.repository) {
      return false;
    }
    if (filter.author !== 'all' && review.author !== filter.author) {
      return false;
    }
    return true;
  });
  
  // Get unique values for filter dropdowns
  const repositories = ['all', ...new Set(reviews.map(r => r.repository))];
  const authors = ['all', ...new Set(reviews.map(r => r.author))];
  const statuses = ['all', 'pending', 'completed', 'failed'];

  return (
    <DashboardLayout>
      <header className="bg-white shadow-sm mb-6 -mt-6 py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reviews</h1>
        </div>
      </header>
      
      <main>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-auto">
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={filter.status}
                    onChange={(e) => setFilter({...filter, status: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <label htmlFor="repository-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Repository
                  </label>
                  <select
                    id="repository-filter"
                    value={filter.repository}
                    onChange={(e) => setFilter({...filter, repository: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {repositories.map((repo) => (
                      <option key={repo} value={repo}>
                        {repo === 'all' ? 'All Repositories' : repo}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <select
                    id="author-filter"
                    value={filter.author}
                    onChange={(e) => setFilter({...filter, author: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {authors.map((author) => (
                      <option key={author} value={author}>
                        {author === 'all' ? 'All Authors' : author}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Reviews Table - Desktop view (hidden on mobile) */}
            <div className="bg-white shadow rounded-lg overflow-hidden hidden md:block">
              <div className="min-w-full divide-y divide-gray-200">
                <div className="bg-gray-50">
                  <div className="grid grid-cols-12 divide-x divide-gray-200">
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-1">PR</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-4">Title</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-2">Repository</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-1">Author</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-1">Status</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-1">Score</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-1">Issues</div>
                    <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider col-span-1">Actions</div>
                  </div>
                </div>
                <div className="bg-white divide-y divide-gray-200">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <div key={review.id} className="grid grid-cols-12 divide-x divide-gray-200 hover:bg-gray-50">
                        <div className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 col-span-1">
                          #{review.prId}
                        </div>
                        <div className="px-6 py-4 text-sm text-gray-900 col-span-4">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {review.prTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            Branch: {review.branch}
                          </div>
                        </div>
                        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 col-span-2 truncate">
                          {review.repository}
                        </div>
                        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 col-span-1">
                          {review.author}
                        </div>
                        <div className="px-6 py-4 whitespace-nowrap col-span-1">
                          <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                            review.status === 'completed' ? 'bg-green-100 text-green-800' :
                            review.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </span>
                        </div>
                        <div className="px-6 py-4 whitespace-nowrap text-sm col-span-1">
                          {review.status === 'completed' ? (
                            <span className={`font-bold ${getScoreColor(review.overallScore)}`}>
                              {review.overallScore}/100
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                        <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 col-span-1">
                          {review.status === 'completed' ? (
                            <div className="flex space-x-2">
                              <span className="text-red-600">{review.issueStats.critical}</span>
                              <span className="text-amber-600">{review.issueStats.warning}</span>
                              <span className="text-blue-600">{review.issueStats.suggestion}</span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                        <div className="px-6 py-4 whitespace-nowrap text-sm font-medium col-span-1">
                          <Link 
                            href={`/reviews/${review.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-500 text-center col-span-12">
                      No reviews match the selected filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reviews Cards - Mobile view (hidden on desktop) */}
            <div className="md:hidden space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">PR #{review.prId}</h3>
                          <p className="text-sm text-gray-500">{review.repository}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          review.status === 'completed' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <h4 className="font-medium text-gray-900 mb-2">{review.prTitle}</h4>
                      <p className="text-sm text-gray-500 mb-1">Branch: {review.branch}</p>
                      <p className="text-sm text-gray-500 mb-1">Author: {review.author}</p>
                      {review.status === 'completed' && (
                        <>
                          <div className="flex justify-between mt-3">
                            <span className="text-sm text-gray-500">Score:</span>
                            <span className={`font-bold ${getScoreColor(review.overallScore)}`}>
                              {review.overallScore}/100
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-500">Issues:</span>
                            <div className="flex space-x-2">
                              <span className="text-red-600">{review.issueStats.critical} Critical</span>
                              <span className="text-amber-600">{review.issueStats.warning} Warning</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                      <Link 
                        href={`/reviews/${review.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white shadow rounded-lg p-4 text-sm text-gray-500 text-center">
                  No reviews match the selected filters.
                </div>
              )}
            </div>
            
            {/* Pagination (simplified) */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
              <div className="flex-1 flex justify-between">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={true}
                >
                  Previous
                </button>
                <div className="hidden sm:flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReviews.length}</span> of{' '}
                    <span className="font-medium">{filteredReviews.length}</span> results
                  </p>
                </div>
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={true}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </DashboardLayout>
  );
}