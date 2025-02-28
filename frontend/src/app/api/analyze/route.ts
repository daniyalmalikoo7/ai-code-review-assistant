// src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { AnalysisRequest } from '@/types/review';

/**
 * API route to trigger a manual code analysis
 */
export async function POST(request: Request) {
  try {
    // Get backend URL from environment variables
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Parse request body
    const body: AnalysisRequest = await request.json();
    
    if (!body.repositoryUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }
    
    if (!body.prNumber) {
      return NextResponse.json({ error: 'PR number is required' }, { status: 400 });
    }
    
    // Forward the request to the backend
    // In production, we would actually call the backend API
    // For demo purposes, simulate a successful response
    /*
    const response = await fetch(`${backendUrl}/api/code-analyzer/analyze-pr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to initiate analysis' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    */
    
    // Simulate a successful response
    return NextResponse.json({ 
      id: Math.floor(Math.random() * 1000),
      status: 'pending',
      message: 'Analysis initiated successfully'
    });
    
  } catch (error) {
    console.error('Error in analyze API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

/**
 * API route to get the status of an analysis
 */
export async function GET(request: Request) {
  try {
    // Get the analysis ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }
    
    // Get backend URL from environment variables
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Forward the request to the backend
    // In production, we would actually call the backend API
    // For demo purposes, simulate a successful response
    /*
    const response = await fetch(`${backendUrl}/api/code-analyzer/analysis/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to get analysis status' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    */
    
    // Simulate a successful response
    const statuses = ['pending', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return NextResponse.json({ 
      id,
      status: randomStatus,
      progress: randomStatus === 'pending' ? Math.floor(Math.random() * 100) : 100,
      completedAt: randomStatus === 'completed' ? new Date().toISOString() : null
    });
    
  } catch (error) {
    console.error('Error in analyze status API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}