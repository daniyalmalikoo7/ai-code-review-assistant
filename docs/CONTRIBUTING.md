# Contributing to AI Code Review Assistant

Thank you for your interest in contributing to the AI Code Review Assistant! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment. By participating, you are expected to:

- Be respectful and considerate
- Give constructive feedback
- Focus on problem-solving
- Support diversity and inclusion

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/ai-code-review-assistant.git
   cd ai-code-review-assistant
   ```
3. **Set up upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalusername/ai-code-review-assistant.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up development environment** as described in [PROJECT_SETUP.md](PROJECT_SETUP.md)

## Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. **Make your changes** in the appropriate files

3. **Follow the coding standards** (see [Coding Standards](#coding-standards))

4. **Write tests** for your changes (see [Testing Guidelines](#testing-guidelines))

5. **Run the tests** to ensure everything passes:
   ```bash
   npm test
   ```

6. **Commit your changes** with a clear commit message:
   ```bash
   git commit -m "Feature: Add ability to analyze TypeScript files"
   ```

7. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a pull request** against the upstream repository

## Pull Request Process

1. **Make sure your PR addresses a specific issue**. If an issue doesn't exist, create one first.

2. **Update documentation** if necessary.

3. **Include screenshots or demo links** for UI changes.

4. **Ensure all tests pass** and add new tests as appropriate.

5. **Fill out the PR template** completely.

6. **Request a review** from one or more of the core maintainers.

7. **Address review feedback** promptly.

8. **Squash commits** before merging if requested.

## Coding Standards

The project follows these coding standards:

- **TypeScript**: Use proper typing and avoid `any` where possible
- **ESLint**: Follow the ESLint rules configured in the project
- **Prettier**: Code should be properly formatted with Prettier
- **Import order**: Group imports by type (built-in, external, internal)
- **Component structure**: Follow the established component patterns
- **Error handling**: Always handle errors properly
- **Async/await**: Prefer async/await over raw promises

You can check your code against these standards by running:

```bash
# For backend
cd backend
npm run lint

# For frontend
cd frontend
npm run lint
```

## Testing Guidelines

Every code contribution should include appropriate tests:

- **Unit tests** for individual functions and components
- **Integration tests** for API endpoints and service interactions
- **UI tests** for frontend components

Tests should be:

- **Isolated**: Not dependent on external services
- **Fast**: Run quickly to enable rapid development
- **Comprehensive**: Cover positive and negative cases
- **Readable**: Easy to understand what is being tested

## Documentation

Update documentation for your changes:

- **Code comments**: Add JSDoc comments for functions and classes
- **README updates**: If you change functionality described in the README
- **API documentation**: Update API_DOCUMENTATION.md for API changes
- **User documentation**: Update relevant guides if user-facing features change

## Issue Reporting

When reporting issues, please include:

1. **Steps to reproduce** the issue
2. **Expected behavior**
3. **Actual behavior**
4. **Environment information** (OS, browser, Node.js version, etc.)
5. **Screenshots** if applicable
6. **Error messages** and stack traces if available

Use the issue templates provided in the repository.

## Adding New Features

When proposing new features:

1. **Start a discussion** in the "Discussions" section before creating a PR
2. **Explain the use case** and benefits of the feature
3. **Consider the implementation complexity**
4. **Think about the maintenance burden**

Thank you for contributing to AI Code Review Assistant!