# Authentication Setup

This document outlines how to set up and use the authentication system for the AI Code Review Assistant.

## Overview

The authentication system uses GitHub OAuth for user authentication and JWT tokens for session management. This allows users to log in with their GitHub account and grants the application access to their repositories for code review.

## Setup Instructions

### 1. Create a GitHub OAuth App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "OAuth Apps" > "New OAuth App"
3. Fill in the following details:
   - **Application name**: AI Code Review Assistant
   - **Homepage URL**: http://localhost:3000 (or your production URL)
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback
4. Register the application and note down the Client ID and Client Secret

### 2. Set Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
JWT_SECRET=a_secure_random_string
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Webhook for GitHub Integration

1. Go to your GitHub repository settings
2. Navigate to "Webhooks" > "Add webhook"
3. Set the Payload URL to: `https://your-backend-url.com/api/webhooks/github`
4. Set Content type to: `application/json`
5. Set Secret to the same value as GITHUB_WEBHOOK_SECRET
6. Select events: "Pull requests"
7. Ensure webhook is active

## API Endpoints

### Authentication Endpoints

- **GET /api/auth/github** - Initiates the GitHub OAuth flow
- **GET /api/auth/github/callback** - Handles the OAuth callback from GitHub
- **GET /api/auth/me** - Returns the current authenticated user (requires JWT token)
- **POST /api/auth/validate-github-token** - Validates a GitHub personal access token

### Using JWT Authentication

For protected API endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Testing Authentication

You can test authentication by opening:

```
http://localhost:3001/api/auth/github
```

This will redirect you to GitHub for authorization, then back to your frontend application with a JWT token.

## Security Considerations

- Store the JWT token securely on the client side (e.g., in HttpOnly cookies)
- Protect the JWT secret and GitHub credentials
- Implement token refresh logic for long-term sessions
- Regularly rotate webhook secrets and JWT secrets

## Troubleshooting

### Common Issues

1. **"Invalid redirect_uri" error from GitHub**: Ensure the callback URL in your GitHub OAuth App settings exactly matches the value in REDIRECT_URI.

2. **"Invalid client_secret" error**: Double-check your GITHUB_CLIENT_SECRET environment variable.

3. **401 Unauthorized errors**: Ensure the JWT token is properly included in the Authorization header and has not expired.

4. **404 Not Found for webhook events**: Check that your GitHub webhook is properly configured with the correct URL.