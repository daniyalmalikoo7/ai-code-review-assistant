# Deployment Guide

This guide provides step-by-step instructions for deploying the AI Code Review Assistant to production environments.

## Deployment Options

The application consists of two main components that need to be deployed:

1. **Backend API Server**: Node.js Express application
2. **Frontend Web Application**: Next.js application

## Prerequisites

Before deploying, ensure you have:

1. Production-ready environment variables
2. GitHub OAuth credentials for production
3. A valid API key for the LLM service
4. Access to deployment platforms (Heroku, Vercel, or similar)

## Backend Deployment

### Option 1: Heroku Deployment

#### Manual Deployment

1. **Create a Heroku account** if you don't have one already

2. **Install the Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create a new Heroku app**:
   ```bash
   cd backend
   heroku create your-code-review-backend
   ```

5. **Configure environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set ANTHROPIC_API_KEY=your_anthropic_api_key
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
   heroku config:set GITHUB_CLIENT_ID=your_github_oauth_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy to Heroku**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

   If that doesn't work, you can use:
   ```bash
   git push heroku `git subtree split --prefix backend main`:main
   ```

7. **Verify the deployment**:
   ```bash
   heroku open
   ```

#### Using Deployment Script

We've provided a deployment script that automates most of the process:

```bash
cd backend
chmod +x deploy/deploy-heroku.sh
./deploy/deploy-heroku.sh your-code-review-backend
```

Follow the prompts to set up your environment variables.

### Option 2: Docker Deployment

1. **Build the Docker image**:
   ```bash
   cd backend
   docker build -t code-review-backend .
   ```

2. **Run the container locally** (for testing):
   ```bash
   docker run -p 3001:3001 --env-file .env.production code-review-backend
   ```

3. **Deploy to a container platform** like Google Cloud Run, AWS ECS, or DigitalOcean App Platform.

## Frontend Deployment

### Option 1: Vercel Deployment

#### Manual Deployment

1. **Create a Vercel account** if you don't have one already

2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy to Vercel**:
   ```bash
   cd frontend
   vercel
   ```

5. **Configure environment variables**:
   - Go to the Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add `NEXT_PUBLIC_BACKEND_URL` with your backend URL

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

#### Using Deployment Script

We've provided a deployment script that automates most of the process:

```bash
cd frontend
chmod +x deploy-vercel.sh
./deploy-vercel.sh production
```

Follow the prompts to configure your environment variables.

### Option 2: Static Export

If you prefer to host the frontend on a static hosting service:

1. **Build the static export**:
   ```bash
   cd frontend
   npm run build
   npm run export
   ```

2. **Deploy the `out` directory** to any static hosting service like Netlify, AWS S3, or GitHub Pages.

## CI/CD Deployment with GitHub Actions

We've configured GitHub Actions workflows for automated deployment:

### Setup Secrets

In your GitHub repository, go to Settings > Secrets and add the following secrets:

For backend deployment:
- `HEROKU_API_KEY`: Your Heroku API key
- `HEROKU_APP_NAME`: Your Heroku app name

For frontend deployment:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `BACKEND_URL`: Your backend URL

### Trigger Deployment

The deployment workflow runs automatically when you push to the `main` branch.

You can also trigger it manually:
1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select the "Deploy" workflow
4. Click "Run workflow"

## Post-Deployment Steps

After deploying both the backend and frontend, complete these steps:

1. **Update GitHub OAuth App settings** with your production callback URL
2. **Configure GitHub webhook** in your repository to point to your production backend
3. **Test the complete flow** by creating a pull request in your repository
4. **Monitor the logs** for any errors

## Monitoring and Maintenance

### Backend Monitoring

```bash
heroku logs --tail --app your-code-review-backend
```

### Performance Monitoring

Consider adding a monitoring service like:
- New Relic
- Datadog
- Sentry

### Regular Maintenance

1. Keep dependencies updated:
   ```bash
   npm audit
   npm outdated
   npm update
   ```

2. Review and rotate secrets periodically
3. Monitor API usage and rate limits

## Scaling Considerations

If your application grows, consider:

1. **Adding a database** for persistent storage
2. **Implementing caching** for frequently accessed data
3. **Setting up a queue** for processing PR analysis asynchronously
4. **Implementing rate limiting** to prevent abuse

## Troubleshooting Production Issues

### Backend Issues

- **Check application logs** for error messages
- **Verify environment variables** are set correctly
- **Confirm API access** to external services (GitHub, LLM)

### Frontend Issues

- **Check browser console** for error messages
- **Verify API connection** to the backend
- **Confirm environment variables** are set correctly