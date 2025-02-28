// src/components/dashboard/StatsSummary.tsx
import React from 'react';
import { ReviewSummary } from '@/types/review';

interface StatsSummaryProps {
  reviews: ReviewSummary[];
}

export default function StatsSummary({ reviews }: StatsSummaryProps) {
  // Calculate statistics
  const totalReviews = reviews.length;
  const completedReviews = reviews.filter(r => r.status === 'completed').length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const failedReviews = reviews.filter(r => r.status === 'failed').length;
  
  // Calculate total issues
  const totalCritical = reviews.reduce((acc, review) => acc + review.issueStats.critical, 0);
  const totalWarnings = reviews.reduce((acc, review) => acc + review.issueStats.warning, 0);
  const totalSuggestions = reviews.reduce((acc, review) => acc + review.issueStats.suggestion, 0);
  
  // Calculate average score for completed reviews
  const completedReviewsList = reviews.filter(r => r.status === 'completed');
  const averageScore = completedReviewsList.length > 0 
    ? Math.round(completedReviewsList.reduce((acc, review) => acc + review.overallScore, 0) / completedReviewsList.length) 
    : 0;
  
  const stats = [
    { name: 'Total Reviews', value: totalReviews, color: 'bg-blue-500' },
    { name: 'Completed', value: completedReviews, color: 'bg-green-500' },
    { name: 'In Progress', value: pendingReviews, color: 'bg-yellow-500' },
    { name: 'Failed', value: failedReviews, color: 'bg-red-500' },
  ];
  
  const issueStats = [
    { name: 'Critical Issues', value: totalCritical, color: 'bg-red-500' },
    { name: 'Warnings', value: totalWarnings, color: 'bg-yellow-500' },
    { name: 'Suggestions', value: totalSuggestions, color: 'bg-blue-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color}`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
      
      {/* Average Score Card */}
      <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6 sm:col-span-2">
        <dt>
          <div className="absolute rounded-md p-3 bg-indigo-500">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="ml-16 truncate text-sm font-medium text-gray-500">Average Score</p>
        </dt>
        <dd className="ml-16 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{averageScore}/100</p>
        </dd>
      </div>
      
      {issueStats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color}`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
}