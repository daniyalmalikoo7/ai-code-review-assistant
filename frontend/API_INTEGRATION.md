# API Integration Guide

This guide outlines the steps needed to integrate the frontend with the real backend API.

## 1. Environment Configuration

### Create Environment Variables

1. Create `.env.local` file in the frontend root directory:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_VERSION=v1
```

2. Update these variables for different environments (development, staging, production)

### Access Environment Variables

Use environment variables in your code:

```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
```

## 2. Update API Client

In `/src/lib/api.ts`, replace the mock implementations with real API calls:

```typescript
// Replace mock data functions with real API calls
export const apiClient = {
  // Get all reviews
  async getReviews(): Promise<ReviewSummary[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code-analyzer/reviews`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Other API methods...
}
```

## 3. Update API Routes

Replace mock data in API routes with real backend calls:

### Reviews API Route

Update `/src/app/api/reviews/route.ts`:

```typescript
export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
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
  } catch (error) {
    console.error('Error in reviews API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}
```

### Review Detail API Route

Update `/src/app/api/reviews/[id]/route.ts` similarly.

## 4. Update Page Components

Replace mock data fetching with API client calls in page components:

### Dashboard Page

In `/src/app/dashboard/page.tsx`:

```typescript
useEffect(() => {
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace mock data with actual API call
      const data = await apiClient.getReviews();
      setReviews(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      setLoading(false);
    }
  };
  
  fetchReviews();
}, []);
```

### Review Detail Page

Update `/src/app/reviews/[id]/page.tsx`:

```typescript
useEffect(() => {
  const fetchReview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace mock with actual API call
      const data = await apiClient.getReviewById(reviewId);
      setReview(data);
      
      if (data.fileReports && data.fileReports.length > 0 && 
          data.fileReports[0].comments && data.fileReports[0].comments.length > 0) {
        setSelectedIssue(data.fileReports[0].comments[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch review:', err);
      setError('Failed to load review details. Please try again later.');
      setLoading(false);
    }
  };
  
  fetchReview();
}, [reviewId]);
```

### Reviews Index Page

Update `/src/app/reviews/page.tsx` similarly.

## 5. Authentication and Headers

Add authentication headers to API requests:

```typescript
// Example using authentication token
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}
```

## 6. Error Handling

Implement more robust error handling:

```typescript
try {
  const data = await apiClient.getReviews();
  // Handle success
} catch (error) {
  // Check for specific error types
  if (error.status === 401) {
    // Handle unauthorized error (e.g., redirect to login)
  } else if (error.status === 404) {
    // Handle not found error
  } else {
    // Handle generic error
    setError('An unexpected error occurred. Please try again later.');
  }
}
```

## 7. Real-time Updates (Optional)

For real-time updates of review status:

```typescript
// Using WebSockets for real-time updates
const setupWebSocket = () => {
  const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/reviews`);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'review_updated') {
      // Update review in state
      updateReview(data.review);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return socket;
};
```

## 8. Testing API Integration

1. Set up a test environment pointing to your backend
2. Test each API endpoint with valid and invalid data
3. Verify error handling works as expected
4. Test with different network conditions (slow, disconnected)

## 9. Form Submissions

Update form submissions to use the API:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    const response = await apiClient.triggerAnalysis({
      repositoryUrl: formState.repositoryUrl,
      prNumber: formState.prNumber,
      branch: formState.branch
    });
    
    // Handle success
    onSuccess(response.id);
  } catch (error) {
    // Handle error
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

## 10. File Structure Recommendations

Organize API-related code:

```
/src
  /lib
    /api
      /clients        # API clients for different services
        github.ts     # GitHub specific API functions
        reviews.ts    # Review related API functions
      /hooks          # Custom hooks for API data
        useReviews.ts # Hook for fetching reviews
      index.ts        # Main exports
    /auth             # Authentication utilities
    /utils            # General utilities
```

## 11. Authentication Flow

For secure API access, implement a proper authentication flow:

1. Create login/register pages
2. Store tokens securely (localStorage, cookies)
3. Implement token refresh logic
4. Add protected routes

## 12. Deployment Considerations

1. Set up environment variables in your deployment platform
2. Configure CORS on the backend to allow your frontend domain
3. Set up proper error logging
4. Consider implementing a CDN for static assets