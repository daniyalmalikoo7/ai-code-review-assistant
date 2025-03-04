# Deployment Guide for AI Code Review Assistant

This document outlines how to deploy both the backend and frontend components of the AI Code Review Assistant for testing and production use.

## Prerequisites

Before deploying, ensure you have:

1. Node.js v16+ installed
2. npm or yarn installed
3. Access to a cloud platform if deploying to production (Heroku, Vercel, AWS, etc.)
4. An API key for the LLM service (Anthropic Claude)
5. GitHub account for webhook configuration (if testing GitHub integration)

## Local Deployment for Testing

### Backend

1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/yourusername/ai-code-review-assistant.git
   cd ai-code-review-assistant/backend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```
   PORT=3001
   NODE_ENV=development
   ANTHROPIC_API_KEY=your_anthropic_api_key
   JWT_SECRET=your_jwt_secret_for_auth
   GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   This will start the backend server at http://localhost:3001.

### Frontend

1. **Navigate to the frontend directory and install dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **Create an `.env.local` file**:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   This will start the frontend application at http://localhost:3000.

## Testing Webhook Integration

To test the GitHub webhook integration locally:

1. **Install ngrok** to expose your local server:
   ```bash
   npm install -g ngrok
   ```

2. **Expose your local backend**:
   ```bash
   ngrok http 3001
   ```
   
   This will give you a public URL like `https://abcd1234.ngrok.io`.

3. **Configure a test GitHub repository**:
   - Go to your GitHub repository
   - Navigate to Settings > Webhooks > Add webhook
   - Set the Payload URL to `https://abcd1234.ngrok.io/api/webhooks/github`
   - Set the Content type to `application/json`
   - Set the Secret to match your `GITHUB_WEBHOOK_SECRET`
   - Select "Let me select individual events" and check "Pull requests"
   - Click "Add webhook"

4. **Create a test PR** in your repository to trigger the webhook.

## Production Deployment

### Backend Deployment to Heroku

1. **Create a Heroku account** if you don't have one already.

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
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
   heroku config:set GITHUB_CLIENT_ID=your_github_oauth_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy to Heroku**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

7. **Verify the deployment**:
   ```bash
   heroku open
   ```

### Frontend Deployment to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Follow the prompts to set up your project.

5. **Configure environment variables**:
   - In the Vercel dashboard, go to your project
   - Go to Settings > Environment Variables
   - Add `NEXT_PUBLIC_BACKEND_URL` with the URL of your deployed backend

6. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

## Docker Deployment

For containerized deployment:

### Backend Docker Setup

1. **Create a Dockerfile** in the backend directory:
   ```dockerfile
   FROM node:16-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3001
   
   CMD ["npm", "start"]
   ```

2. **Build and run the Docker image**:
   ```bash
   docker build -t code-review-backend .
   docker run -p 3001:3001 --env-file .env code-review-backend
   ```

### Frontend Docker Setup

1. **Create a Dockerfile** in the frontend directory:
   ```dockerfile
   FROM node:16-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Build and run the Docker image**:
   ```bash
   docker build -t code-review-frontend .
   docker run -p 3000:3000 --env-file .env.local code-review-frontend
   ```

## Production GitHub App Setup

For production deployment, consider creating a GitHub App instead of using webhook:

1. **Create a GitHub App**:
   - Go to GitHub Developer Settings > GitHub Apps > New GitHub App
   - Set the webhook URL to your backend URL
   - Set permissions: Pull requests (read & write), Repository contents (read)
   - Subscribe to events: Pull request
   - Generate a private key and download it

2. **Configure your backend with the GitHub App credentials**:
   - App ID
   - Private key
   - Webhook secret

3. **Install the GitHub App** on repositories where you want to use the code review assistant.

## Troubleshooting Deployment

If you encounter issues:

1. **Check logs**:
   ```bash
   # Backend
   heroku logs --tail
   
   # Frontend
   vercel logs
   ```

2. **Verify environment variables** are correctly set.

3. **Test API endpoints** using tools like Postman or curl.

4. **Check webhook delivery** on GitHub by viewing the webhook's recent deliveries.

5. **Validate CORS settings** in the backend to ensure it accepts requests from your frontend domain.