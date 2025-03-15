// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReviewCard from '@/components/dashboard/ReviewCard';
import StatsSummary from '@/components/dashboard/StatsSummary';
import AnalysisModal from '@/components/dashboard/AnalysisModal';
import { ReviewSummary } from '@/types/review';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch from the real API
        const data = await apiClient.getReviews();
        setReviews(data as ReviewSummary[]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);
  
  const [showAnalysisModal, setShowAnalysisModal] = useState<boolean>(false);
  
  const handleTriggerAnalysis = () => {
    setShowAnalysisModal(true);
  };
  
  const handleAnalysisSuccess = (id: string | number) => {
    // Refresh the list of reviews or navigate to the new review
    router.push(`/reviews/${id}`);
  };

  return (
    <DashboardLayout>
      <header className="bg-white shadow-sm mb-6 -mt-6 py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <button
            type="button"
            onClick={handleTriggerAnalysis}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Analysis
          </button>
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
            <div className="mb-10">
              <StatsSummary reviews={reviews} />
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900 mb-2">Recent Reviews</h2>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                  No reviews found. Use the "New Analysis" button to analyze a repository.
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      {/* Analysis Modal */}
      <AnalysisModal 
        isOpen={showAnalysisModal} 
        onClose={() => setShowAnalysisModal(false)}
        onSuccess={handleAnalysisSuccess}
      />
    </DashboardLayout>
  );
}