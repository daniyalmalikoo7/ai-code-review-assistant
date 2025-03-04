# GitHub Integration Guide

This document outlines how to set up and configure GitHub integration with the AI Code Review Assistant.

## Prerequisites

Before setting up the GitHub integration, you need:

- A GitHub account with admin access to the repositories you want to integrate
- The AI Code Review Assistant backend deployed or running locally
- Admin permissions to create webhooks and GitHub OAuth Apps

## Integration Options

There are two main methods to integrate with GitHub:

1. **Webhook Integration**: For automated review of pull requests
2. **OAuth Integration**: For user authentication and repository access

## 1. Setting Up Webhook Integration

### Create a GitHub Webhook

1. Go to your GitHub repository
2. Navigate to **Settings** > **Webhooks** > **Add webhook**
3. Configure the webhook:
   - **Payload URL**: `https://your-backend-url.com/api/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Create a secure random string (keep this for your backend configuration)
   - **Events to trigger webhook**: Select "Pull requests"
   - **Active**: Check this box

4. Click "Add webhook"

### Configure Backend for Webhook Processing

1. Set the webhook secret in your backend environment:
   ```
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   ```

2. Ensure your backend is accessible from the internet (for GitHub to send webhook events)

3. Test the webhook:
   - Create a new pull request in your repository
   - Check GitHub webhook deliveries (Settings > Webhooks > Recent Deliveries)
   - Verify that your backend received and processed the event

## 2. Setting Up OAuth Integration

### Create a GitHub OAuth App

1. Go to GitHub Developer Settings (https://github.com/settings/developers)
2. Click on "OAuth Apps" and then "New OAuth App"
3. Fill in the application details:
   - **Application name**: AI Code Review Assistant
   - **Homepage URL**: Your frontend URL (e.g., `https://your-frontend-url.com`)
   - **Application description**: Optional but recommended
   - **Authorization callback URL**: `https://your-backend-url.com/api/auth/github/callback`

4. Click "Register application"
5. Note your Client ID
6. Generate a client secret and note it (you'll only see it once)

### Configure Backend for OAuth Authentication

1. Set the GitHub OAuth credentials in your backend environment:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   REDIRECT_URI=https://your-backend-url.com/api/auth/github/callback
   FRONTEND_URL=https://your-frontend-url.com
   ```

2. Set a secure JWT secret for token generation:
   ```
   JWT_SECRET=your_secure_random_string
   ```

### Configure Frontend for OAuth Authentication

1. Update your frontend environment to point to the backend:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
   ```

2. Test the OAuth flow:
   - Go to your frontend application
   - Click "Login with GitHub"
   - Authorize the application
   - You should be redirected back to your application and authenticated

## 3. Using Personal Access Tokens

For repositories where you can't set up webhooks or for testing purposes, you can use GitHub Personal Access Tokens (PATs).

### Generate a Personal Access Token

1. Go to GitHub Developer Settings (https://github.com/settings/tokens)
2. Click "Generate new token" > "Generate new token (classic)"
3. Provide a note for your token (e.g., "AI Code Review Assistant")
4. Select scopes:
   - `repo` (for full repository access)
   - `read:user` and `user:email` (for user information)
5. Click "Generate token"
6. Copy the token (you'll only see it once)

### Configure the Token in the Application

1. Login to the AI Code Review Assistant frontend
2. Go to Settings > GitHub Integration
3. Enter your Personal Access Token
4. Select the repositories you want to monitor
5. Save your settings

## 4. Troubleshooting GitHub Integration

### Webhook Issues

- **404 Not Found**: Check that your backend URL is correct and the server is running
- **401 Unauthorized**: Verify that the webhook secret matches between GitHub and your backend
- **Timeout**: Ensure your backend responds within 10 seconds (GitHub's timeout limit)
- **Payload Not Delivered**: Check your firewall settings and make sure your server accepts POST requests

### OAuth Issues

- **Redirect URI Mismatch**: Ensure the callback URL in your GitHub OAuth App matches exactly what's in your backend configuration
- **Authorization Error**: Check that your client ID and client secret are correct
- **Token Expiration**: If users are unexpectedly logged out, check your JWT token expiration settings

## 5. Future GitLab Integration

The system is designed to allow future integration with GitLab. The steps would be similar:

1. Create a GitLab application in your GitLab instance
2. Configure webhooks to send merge request events
3. Implement OAuth flow for GitLab authentication
4. Update the backend to handle GitLab-specific payloads

## 6. Future Bitbucket Integration

For Bitbucket integration, the system would need:

1. Create a Bitbucket OAuth Consumer
2. Set up webhooks for pull request events
3. Implement the OAuth flow for Bitbucket
4. Add support for Bitbucket-specific API endpoints and payload formats

## 7. Best Practices for Repository Integration

1. **Gradually Roll Out**: Start with a single, non-critical repository to test the integration
2. **Review Permissions**: Use the principle of least privilege for access tokens
3. **Monitor Usage**: Keep an eye on the rate of reviews and API rate limits
4. **Document Conventions**: Create guidelines for how developers should respond to automated reviews
5. **Customize Sensitivity**: Adjust the severity thresholds based on your team's preferences