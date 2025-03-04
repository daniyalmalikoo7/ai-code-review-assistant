# API Documentation

This document provides details for all available API endpoints in the AI Code Review Assistant.

## Base URL

- Development: `http://localhost:3001`
- Production: `https://your-backend-url.herokuapp.com`

## Authentication

Most endpoints require authentication via JSON Web Tokens (JWT).

Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Health Check

#### `GET /api/health`

Checks if the API is operational.

**Authentication required**: No

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2023-06-01T12:00:00Z",
  "uptime": 3600
}
```

### Authentication

#### `GET /api/auth/github`

Initiates the GitHub OAuth flow.

**Authentication required**: No

**Response**: Redirects to GitHub for authentication

#### `GET /api/auth/github/callback`

Handles the callback from GitHub OAuth.

**Authentication required**: No

**Query Parameters**:
- `code` (string, required): The authorization code from GitHub

**Response**: Redirects to frontend with token

#### `GET /api/auth/me`

Returns the currently authenticated user.

**Authentication required**: Yes

**Response**:
```json
{
  "user": {
    "userId": 123,
    "username": "developer",
    "email": "developer@example.com"
  }
}
```

#### `POST /api/auth/validate-github-token`

Validates a GitHub personal access token.

**Authentication required**: No

**Request Body**:
```json
{
  "token": "github_personal_access_token"
}
```

**Response**:
```json
{
  "valid": true,
  "username": "github_username"
}
```

### Code Analysis

#### `POST /api/code-analyzer/analyze-pr`

Analyzes a pull request.

**Authentication required**: Yes

**Request Body**:
```json
{
  "id": 123,
  "title": "Add user authentication",
  "branch": "feature/auth",
  "base": "main",
  "repository": "owner/repo",
  "author": "developer",
  "changes": [
    {
      "filename": "src/auth/login.ts",
      "status": "added",
      "content": "function login() { /* code content */ }"
    }
  ]
}
```

**Response**:
```json
{
  "prId": 123,
  "issues": [
    {
      "id": "security-1",
      "title": "Hardcoded API Key",
      "description": "Found potential hardcoded API key in the code",
      "category": "Security",
      "severity": "Critical",
      "location": {
        "file": "src/auth/auth.service.ts",
        "line": 42
      },
      "snippet": "const apiKey = \"1234567890abcdef\";",
      "remediation": "Use environment variables or a secure secrets manager instead of hardcoding API keys"
    }
  ],
  "summary": {
    "totalIssues": 1,
    "criticalCount": 1,
    "warningCount": 0,
    "suggestionCount": 0,
    "issuesByCategory": {
      "Security": 1,
      "Performance": 0,
      "CodeStyle": 0,
      "Maintainability": 0,
      "Architecture": 0
    }
  },
  "metadata": {
    "analyzedAt": "2023-06-01T12:00:00Z",
    "duration": 1500
  }
}
```

#### `POST /api/code-analyzer/analyze-pr-with-feedback`

Analyzes a pull request and generates feedback.

**Authentication required**: Yes

**Request Body**: Same as `analyze-pr`

**Response**:
```json
{
  "analysis": {
    // Same as analyze-pr response
  },
  "feedback": {
    "inlineComments": [
      {
        "file": "src/auth/auth.service.ts",
        "line": 42,
        "message": "🚨 **Critical: Hardcoded API Key**\n\nFound potential hardcoded secret in the code\n\n```\napiKey = \"1234567890abcdef\"\n```\n\n**Why it matters**: Security issues can lead to vulnerabilities that may be exploited by attackers.\n\n**Recommendation**: Use environment variables or a secure secrets manager instead of hardcoding secrets",
        "severity": "Critical",
        "category": "Security",
        "suggestionId": "security-hardcoded-123"
      }
    ],
    "summaryReport": {
      "prId": 123,
      "title": "AI Code Review",
      "overallScore": 75,
      "issueStats": {
        "critical": 1,
        "warning": 0,
        "suggestion": 0,
        "total": 1
      },
      "topIssues": [
        {
          "severity": "Critical",
          "category": "Security",
          "title": "Hardcoded API Key",
          "file": "src/auth/auth.service.ts",
          "line": 42
        }
      ],
      "fileReports": [],
      "analysisTime": "2023-06-01T12:05:30Z",
      "duration": 1500
    },
    "markdownSummary": "# AI Code Review for PR #123\n\n..."
  }
}
```

### LLM Endpoints

#### `POST /api/llm/analyze`

Analyzes code using the LLM.

**Authentication required**: Yes

**Request Body**:
```json
{
  "code": "function example() { /* code to analyze */ }",
  "language": "javascript"
}
```

**Response**:
```json
{
  "analysis": "Detailed analysis of the code..."
}
```

#### `POST /api/llm/prompt`

Sends a single prompt to the LLM.

**Authentication required**: Yes

**Request Body**:
```json
{
  "prompt": "What are common security issues in JavaScript?",
  "systemPrompt": "You are a security expert helping developers write secure code.",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

**Response**:
```json
{
  "response": "LLM response text..."
}
```

#### `POST /api/llm/chain`

Executes a chain of prompts.

**Authentication required**: Yes

**Request Body**:
```json
{
  "prompts": [
    "Analyze this code for security issues: [code]",
    "Suggest improvements for the identified issues"
  ],
  "options": {
    "temperature": 0.7
  }
}
```

**Response**:
```json
{
  "response": "LLM chain response text..."
}
```

### Settings

#### `GET /api/settings`

Gets user settings.

**Authentication required**: Yes

**Response**:
```json
{
  "github": {
    "personalAccessToken": "***",
    "webhookSecret": "***",
    "enabled": true,
    "repositories": ["owner/repo"],
    "autoReview": true
  },
  "api": {
    "apiKey": "***"
  },
  "notifications": {
    "email": true,
    "emailAddress": "user@example.com",
    "slack": false,
    "slackWebhook": "",
    "notifyOnCritical": true,
    "notifyOnComplete": true
  }
}
```

#### `POST /api/settings`

Updates user settings.

**Authentication required**: Yes

**Request Body**:
```json
{
  "github": {
    "personalAccessToken": "github_token",
    "webhookSecret": "webhook_secret",
    "enabled": true,
    "repositories": ["owner/repo"],
    "autoReview": true
  },
  "api": {
    "apiKey": "api_key"
  },
  "notifications": {
    "email": true,
    "emailAddress": "user@example.com",
    "slack": false,
    "slackWebhook": "",
    "notifyOnCritical": true,
    "notifyOnComplete": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": { ... }
}
```

#### `DELETE /api/settings`

Deletes user settings.

**Authentication required**: Yes

**Response**:
```json
{
  "success": true,
  "message": "Settings deleted successfully"
}
```

### Webhooks

#### `POST /api/webhooks/github`

Handles GitHub webhook events.

**Authentication required**: No (uses webhook secret for validation)

**Headers**:
- `X-GitHub-Event`: Event type (e.g., "pull_request")
- `X-GitHub-Delivery`: Delivery ID
- `X-Hub-Signature-256`: HMAC signature for verification

**Request Body**: GitHub webhook payload

**Response**:
```json
{
  "status": "success",
  "prId": 123,
  "repository": "owner/repo",
  "issueCount": 5,
  "score": 80
}
```

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "error": "Error message describing the issue",
  "status": 400  // HTTP status code
}
```

Common error status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid authentication)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error (unexpected server-side issue)