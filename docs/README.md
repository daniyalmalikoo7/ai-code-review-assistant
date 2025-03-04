# AI Code Review Assistant Documentation

Welcome to the AI Code Review Assistant documentation. This guide will help you understand, set up, and use the system effectively.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Documentation Guides](#documentation-guides)
4. [Contributing](#contributing)
5. [Support](#support)

## Project Overview

The AI Code Review Assistant is an intelligent tool designed to automatically review pull requests and provide feedback on code quality, security, performance, and best practices. It uses AI-powered analysis to detect potential issues and suggest improvements.

### Key Features

- Automated code review for GitHub pull requests
- Detection of security vulnerabilities, performance issues, and code smells
- AI-powered suggestions for code improvements
- GitHub integration for pull request comments
- Web dashboard for reviewing and managing code analysis
- Customizable settings and notification preferences

### Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Next.js
- **AI Integration**: LangChain with Claude API
- **Deployment**: Docker, Heroku, Vercel
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Git
- API key from Anthropic

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-code-review-assistant.git
   cd ai-code-review-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your configuration
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Documentation Guides

For more detailed documentation, please refer to the following guides:

- [Project Setup and Development](PROJECT_SETUP.md) - Detailed setup instructions
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [GitHub Integration Guide](GITHUB_INTEGRATION.md) - How to integrate with GitHub
- [Testing Guide](TESTING_GUIDE.md) - Running and writing tests
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Modular Prompts Architecture](MODULAR_PROMPTS.md) - Development approach explanation

## Contributing

We welcome contributions to the AI Code Review Assistant! Please see our [Contributing Guide](CONTRIBUTING.md) for more information on how to get involved.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

## Support

If you encounter any issues or have questions about the AI Code Review Assistant, please:

1. Check the [FAQ](FAQ.md) for common questions
2. Search for existing issues in the GitHub repository
3. Create a new issue if your question hasn't been addressed

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.