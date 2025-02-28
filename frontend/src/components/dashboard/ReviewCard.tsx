// src/components/dashboard/ReviewCard.tsx
import React from 'react';
import Link from 'next/link';
import { ReviewSummary } from '@/types/review';
import StatusBadge from './StatusBadge';
import { getScoreColor } from '@/lib/api';

interface ReviewCardProps {
  review: ReviewSummary;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200 hover:border-blue-400 transition-colors">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            PR #{review.prId}: {review.prTitle.length > 50 ? review.prTitle.substring(0, 50) + '...' : review.prTitle}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {review.repository} • {formattedDate}
          </p>
        </div>
        <StatusBadge status={review.status} />
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Author</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{review.author}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Branch</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{review.branch}</dd>
          </div>
          
          {review.status === 'completed' && (
            <>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Overall Score</dt>
                <dd className={`mt-1 text-sm font-semibold sm:col-span-2 sm:mt-0 ${getScoreColor(review.overallScore)}`}>
                  {review.overallScore}/100
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Issues Found</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <div className="flex space-x-3">
                    <span className="text-red-600 font-medium">{review.issueStats.critical} Critical</span>
                    <span className="text-amber-600 font-medium">{review.issueStats.warning} Warnings</span>
                    <span className="text-blue-600 font-medium">{review.issueStats.suggestion} Suggestions</span>
                  </div>
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
      
      <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
        <Link 
          href={`/reviews/${review.id}`}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}