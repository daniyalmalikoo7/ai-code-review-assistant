# Testing Guide

This document provides detailed instructions on how to run tests for the AI Code Review Assistant.

## Testing Architecture

The project uses a comprehensive testing architecture that includes:

- Unit tests for individual components
- Integration tests for API endpoints and service interactions
- End-to-end tests for complete workflows

## Prerequisites

Before running tests, ensure you have:

1. Node.js (v16 or later) installed
2. All dependencies installed (`npm install`)
3. Test environment variables configured

## Environment Setup for Testing

### Backend Testing Environment

Create a `.env.test` file in the `/backend` directory:

```bash
cd backend
cp .env.example .env.test
```

Edit the `.env.test` file with testing-specific values:

```
NODE_ENV=test
PORT=3001
JWT_SECRET=test-jwt-secret
GITHUB_WEBHOOK_SECRET=test-webhook-secret
```

For integration tests that interact with the LLM API, you'll need to add your API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Frontend Testing Environment

No specific environment setup is needed for frontend tests, as they use mocked API responses.

## Running Tests

### Backend Tests

#### Running All Backend Tests

```bash
cd backend
npm test
```

#### Running Only Unit Tests

```bash
cd backend
npm run test:unit
```

#### Running Only Integration Tests

```bash
cd backend
npm run test:integration
```

#### Running a Specific Test File

```bash
cd backend
npx jest path/to/test-file.test.ts
```

#### Running Tests with Coverage Report

```bash
cd backend
npm run test:coverage
```

### Frontend Tests

#### Running All Frontend Tests

```bash
cd frontend
npm test
```

#### Running Frontend Integration Tests

```bash
cd frontend
npm run test:integration
```

#### Running a Specific Test File

```bash
cd frontend
npx jest path/to/test-file.test.tsx
```

### Running All Project Tests

From the root directory, you can run all tests:

```bash
npm test
```

## Test Types

### Backend Unit Tests

Located in `/backend/tests/` (excluding the `/integration/` subdirectory), these tests verify individual components:

- Controllers
- Services
- Utilities
- Middleware

### Backend Integration Tests

Located in `/backend/tests/integration/`, these tests verify interactions between components:

- API endpoints
- GitHub webhook processing
- LLM integration
- Database operations

### Frontend Tests

Located in `/frontend/src/tests/`, these tests verify:

- React components
- API integrations
- State management
- UI functionality

## Continuous Integration

The project is configured to run tests automatically on GitHub Actions:

- Tests run on every push to the `main` and `develop` branches
- Tests run on every pull request to the `main` and `develop` branches
- The CI pipeline will fail if any tests fail

## Writing New Tests

### Backend Test Guidelines

1. Place unit tests next to the file being tested with a `.test.ts` extension
2. Place integration tests in the `/backend/tests/integration/` directory
3. Use descriptive test names that explain what is being tested
4. Mock external dependencies when appropriate
5. Test both success and failure scenarios

Example backend test:

```typescript
import { someFunction } from './module';

describe('someFunction', () => {
  it('should return the expected result when given valid input', () => {
    const result = someFunction('valid-input');
    expect(result).toBe('expected-output');
  });

  it('should throw an error when given invalid input', () => {
    expect(() => someFunction(null)).toThrow('Invalid input');
  });
});
```

### Frontend Test Guidelines

1. Place component tests in the same directory as the component with a `.test.tsx` extension
2. Use React Testing Library to test components from a user perspective
3. Mock API calls and external dependencies

Example frontend test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import UserComponent from './UserComponent';

describe('UserComponent', () => {
  it('should display user information when loaded', () => {
    render(<UserComponent user={{ name: 'Test User', email: 'test@example.com' }} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<UserComponent user={{ name: 'Test User' }} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalled();
  });
});
```

## Troubleshooting Tests

### Common Backend Test Issues

- **JWT Authentication**: Make sure you're using the test JWT secret in test environments
- **GitHub Webhook Validation**: Ensure the test webhook secret is used in test environments
- **LLM API Integration**: Use mock responses for the LLM API in tests unless specifically testing the integration

### Common Frontend Test Issues

- **Component State**: Use `act()` when changing component state in tests
- **Async Operations**: Use `waitFor()` or `findBy` queries for asynchronous operations
- **React Hooks**: Make sure hooks are used within a component (not directly in tests)