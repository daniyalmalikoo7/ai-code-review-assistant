# Project Setup and Development Guide

This guide provides instructions on how to set up the AI-Powered Code Review Assistant for local development.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v16 or later)
- npm (v7 or later)
- Git

You'll also need:

- An API key from Anthropic for Claude
- GitHub OAuth App credentials (optional, for full GitHub integration)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-code-review-assistant.git
cd ai-code-review-assistant
```

### 2. Install Dependencies

The project is set up as a monorepo with both backend and frontend in a single repository. You can install dependencies for both at once:

```bash
npm install
```

Or install them separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Configuration

Create a `.env` file in the `/backend` directory:

```bash
cd backend
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

#### Frontend Configuration

Create a `.env.local` file in the `/frontend` directory:

```bash
cd ../frontend
```

Add the following content:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 4. Running the Development Servers

You can run both the backend and frontend development servers concurrently:

```bash
# From the root directory
npm run dev
```

Or run them separately:

```bash
# Backend server
cd backend
npm run dev

# Frontend server
cd frontend
npm run dev
```

The backend server will be available at http://localhost:3001, and the frontend at http://localhost:3000.

### 5. Development Workflow

#### Backend Development

The backend is built with Express.js and TypeScript. Key files and directories include:

- `/src/controllers`: API endpoint handlers
- `/src/middleware`: Express middleware functions
- `/src/services`: Core services (LLM, GitHub, etc.)
- `/src/utils`: Utility functions
- `/src/models`: Data models
- `/src/routes`: API route definitions

When making changes to the backend, run the tests to ensure everything works:

```bash
cd backend
npm test
```

#### Frontend Development

The frontend is built with Next.js. Key files and directories include:

- `/src/app`: Next.js app directory (pages and layouts)
- `/src/components`: React components
- `/src/lib`: Utility functions and API client
- `/src/types`: TypeScript type definitions

When making changes to the frontend, you can run the linter and tests:

```bash
cd frontend
npm run lint
npm test
```

### 6. GitHub Integration for Development

To test GitHub integration locally:

1. Create a GitHub OAuth App:
   - Go to GitHub Developer Settings > OAuth Apps > New OAuth App
   - Set the Homepage URL to `http://localhost:3000`
   - Set the Authorization callback URL to `http://localhost:3001/api/auth/github/callback`

2. Create a webhook in a test repository:
   - Use a tool like ngrok to expose your local server: `ngrok http 3001`
   - Set the webhook URL to `https://your-ngrok-url.ngrok.io/api/webhooks/github`
   - Set the content type to `application/json`
   - Set the secret to match your `GITHUB_WEBHOOK_SECRET`
   - Choose the Pull Request event

3. Update your environment variables with the GitHub OAuth App credentials.

### 7. Troubleshooting

- **Backend connection issues**: Make sure the backend server is running on the correct port and the frontend's `NEXT_PUBLIC_BACKEND_URL` environment variable is set correctly.
- **GitHub OAuth errors**: Check that your GitHub OAuth App configuration matches the callback URL in your backend configuration.
- **LLM API errors**: Verify that your API key is correct and has sufficient permissions.