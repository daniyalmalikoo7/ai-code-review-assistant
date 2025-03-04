# End-to-End Integration Testing Guide

This guide explains how to run the integration tests for the AI Code Review Assistant and what they verify.

## Overview

The integration tests verify that:

1. The GitHub webhook endpoint correctly processes PR events
2. The code analyzer and feedback generator produce properly structured output
3. The LLM service integration works as expected
4. The frontend components correctly render analysis results
5. The entire flow from receiving an event to displaying results works

## Prerequisites

Before running the tests, ensure you have:

1. Node.js v16+ installed
2. All dependencies installed (`npm install` in root directory)
3. Backend environment variables configured (see `.env.example`)
4. For full end-to-end tests involving LLM API, you need a valid API key in the `.env` file

## Test Structure

### Backend Integration Tests

- **Webhook Flow Test**: Tests the GitHub webhook endpoint processing
- **Code Analyzer API Test**: Tests the code analysis API endpoints
- **LLM Service Test**: Tests the LLM service endpoints
- **End-to-End Flow Test**: Tests the entire flow from webhook to feedback (needs API key)

### Frontend Integration Tests

- **API Integration Test**: Tests frontend components with mock API responses
- **Pages Integration Test**: Tests full page rendering with mock API

## Running the Tests

### Backend Tests

```bash
# Change to backend directory
cd backend

# Create a .env file with test configuration
cp .env.example .env.test
# Edit .env.test to include test values and API keys

# Run all backend integration tests
npm run test:integration

# Or run specific integration test file
npx jest tests/integration/githubWebhook.integration.test.ts
```

### Frontend Tests

```bash
# Change to frontend directory
cd frontend

# Run frontend integration tests
npm run test:integration

# Or run specific integration test file
npx jest src/tests/integration/api.integration.test.tsx
```

### Running All Tests

From the project root directory, you can run all tests:

```bash
# Run all tests (unit and integration)
npm run test

# Run only integration tests
npm run test:integration
```

## Test Environment Setup

The integration tests use several approaches to create a realistic testing environment:

1. **Mocked Services**: Some services are mocked to isolate testing to specific components
2. **In-memory Server**: Express server is started in-memory for API testing
3. **MSW (Mock Service Worker)**: For frontend tests to mock API responses
4. **JWT Authentication**: Test tokens are generated for authenticated endpoints
5. **Webhook Signatures**: Webhooks are properly signed as they would be from GitHub

## Configuration for Tests

The main configuration options are:

1. **GITHUB_WEBHOOK_SECRET**: Secret used to validate webhook signatures
2. **JWT_SECRET**: Secret used for generating/verifying authentication tokens
3. **ANTHROPIC_API_KEY**: For tests involving real LLM API calls (optional)
4. **NODE_ENV**: Set to 'test' automatically by the test runner

## CI/CD Integration

In a CI/CD environment, tests can be run with:

```bash
# CI mode skips tests requiring real API keys
CI=true npm run test:integration
```

## Deploying Services for Testing

If you want to deploy the services for manual testing, follow these steps:

### Backend Deployment

1. **Local Development**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Docker Deployment**:
   ```bash
   cd backend
   docker build -t code-review-backend .
   docker run -p 3001:3001 -e PORT=3001 -e NODE_ENV=production code-review-backend
   ```

3. **Cloud Deployment** (Heroku example):
   ```bash
   cd backend
   heroku create code-review-backend
   git push heroku main
   ```

### Frontend Deployment

1. **Local Development**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Production Build**:
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

3. **Vercel Deployment**:
   ```bash
   cd frontend
   vercel deploy
   ```

## Webhook Testing

To test webhooks against your deployed backend:

1. Use a tool like ngrok to expose your local server:
   ```bash
   ngrok http 3001
   ```

2. Configure a GitHub repository webhook pointing to your ngrok URL:
   ```
   https://<your-ngrok-subdomain>.ngrok.io/api/webhooks/github
   ```

3. Set the webhook secret to match your GITHUB_WEBHOOK_SECRET environment variable

4. Create or update a PR to trigger the webhook

## Troubleshooting

If tests fail, check the following:

1. **Environment Variables**: Make sure all required variables are set
2. **API Keys**: For tests using real services, ensure API keys are valid
3. **Node Version**: Ensure you're using Node.js v16 or higher
4. **Dependencies**: Make sure all dependencies are installed
5. **Port Conflicts**: Check that no other services are using the test ports
6. **Timeouts**: For slow API responses, increase the test timeout values

## Known Limitations

1. The end-to-end flow test requires a valid API key and is skipped in CI environments
2. Some frontend tests simulate navigation but don't test actual page transitions
3. GitHub API is mocked and doesn't test actual GitHub API responses