// src/components/reviews/IssueSummary.tsx
import React from 'react';
import { DetailedReview } from '@/types/review';
import { getScoreColor } from '@/lib/api';

interface IssueSummaryProps {
  review: DetailedReview;
}

export default function IssueSummary({ review }: IssueSummaryProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Review Summary
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overall assessment of PR #{review.prId}
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Pull Request</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">#{review.prId}: {review.prTitle}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Repository</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{review.repository}</dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Branch</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{review.branch}</dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Author</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{review.author}</dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Analysis Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {new Date(review.analysisTime).toLocaleString()}
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Analysis Duration</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {review.duration < 1000 
                ? `${review.duration}ms` 
                : `${(review.duration / 1000).toFixed(2)}s`}
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Overall Score</dt>
            <dd className={`mt-1 text-sm font-bold sm:col-span-2 sm:mt-0 ${getScoreColor(review.overallScore)}`}>
              {review.overallScore}/100
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Issue Summary</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <div className="flex space-x-6">
                <div>
                  <span className="block font-medium text-red-600">{review.issueStats.critical}</span>
                  <span className="text-gray-500">Critical</span>
                </div>
                <div>
                  <span className="block font-medium text-amber-600">{review.issueStats.warning}</span>
                  <span className="text-gray-500">Warnings</span>
                </div>
                <div>
                  <span className="block font-medium text-blue-600">{review.issueStats.suggestion}</span>
                  <span className="text-gray-500">Suggestions</span>
                </div>
                <div>
                  <span className="block font-medium">{review.issueStats.total}</span>
                  <span className="text-gray-500">Total Issues</span>
                </div>
              </div>
            </dd>
          </div>
          
          {review.topIssues.length > 0 && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Top Issues</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul className="divide-y divide-gray-200">
                  {review.topIssues.map((issue, index) => (
                    <li key={index} className="py-2">
                      <div className="flex items-start">
                        {issue.severity === 'Critical' && (
                          <span className="text-red-600 mr-2">🚨</span>
                        )}
                        {issue.severity === 'Warning' && (
                          <span className="text-amber-600 mr-2">⚠️</span>
                        )}
                        {issue.severity === 'Suggestion' && (
                          <span className="text-blue-600 mr-2">💡</span>
                        )}
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-gray-500">
                            {issue.file}{issue.line ? `:${issue.line}` : ''}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}