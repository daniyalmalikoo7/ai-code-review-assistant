// src/app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { ReviewSummary } from '@/types/review';

/**
 * API route to get all reviews
 */
export async function GET() {
  try {
    // Get backend URL from environment variables
    //const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Forward the request to the backend
    // In production, we would actually call the backend API
    // For demo purposes, simulate a response with mock data
    /*
    const response = await fetch(`${backendUrl}/api/code-analyzer/reviews`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch reviews' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    */
    
    // Generate mock data
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
      }
    ];
    
    return NextResponse.json(mockReviews);
    
  } catch (error) {
    console.error('Error in reviews API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}