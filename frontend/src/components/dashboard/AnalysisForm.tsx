// src/components/dashboard/AnalysisForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisFormProps {
  onCancel: () => void;
  onSuccess?: (id: string | number) => void;
}

export default function AnalysisForm({ onCancel, onSuccess }: AnalysisFormProps) {
  const router = useRouter();
  
  const [formState, setFormState] = useState({
    repositoryUrl: '',
    prNumber: '',
    branch: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formState.repositoryUrl) {
      setError('Repository URL is required');
      return;
    }
    
    if (!formState.prNumber) {
      setError('PR number is required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Call the API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formState,
          manual: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate analysis');
      }
      
      const data = await response.json();
      
      // Call success callback or redirect
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        router.push('/reviews');
      }
      
    } catch (err) {
      console.error('Error triggering analysis:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">New Manual Analysis</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Specify repository and pull request details to trigger a manual code review.</p>
        </div>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700">
              Repository URL or name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="repositoryUrl"
                id="repositoryUrl"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="owner/repo"
                value={formState.repositoryUrl}
                onChange={handleChange}
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the full repository URL or the owner/repo format (e.g., github.com/owner/repo or owner/repo)
            </p>
          </div>
          
          <div>
            <label htmlFor="prNumber" className="block text-sm font-medium text-gray-700">
              Pull Request Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="prNumber"
                id="prNumber"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="123"
                value={formState.prNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
              Branch (optional)
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="branch"
                id="branch"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="feature/branch-name"
                value={formState.branch}
                onChange={handleChange}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              If left blank, the system will detect the branch from the PR
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting Analysis...
                </>
              ) : (
                "Start Analysis"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}