# AI-Powered Code Review Assistant

An intelligent code review assistant that helps developers maintain code quality and follow best practices by providing automated analysis of pull requests.

[![Tests](https://github.com/yourusername/ai-code-review-assistant/actions/workflows/test.yml/badge.svg)](https://github.com/yourusername/ai-code-review-assistant/actions/workflows/test.yml)
[![Deploy](https://github.com/yourusername/ai-code-review-assistant/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/ai-code-review-assistant/actions/workflows/deploy.yml)

## Features

- **Automated Pull Request Analysis**: Detect issues in code as soon as a PR is opened or updated
- **AI-Powered Insights**: Leverage advanced AI models to identify complex code issues
- **Security Vulnerability Detection**: Find security risks like SQL injection, XSS, and hardcoded credentials
- **Performance Optimization**: Identify inefficient code patterns and suggest improvements
- **Code Quality Checks**: Enforce consistent code style and best practices
- **GitHub Integration**: Seamlessly integrate with GitHub repositories and PR workflows
- **Detailed Reports**: Get comprehensive reports with issue explanations and suggested fixes
- **Dashboard Interface**: View and manage code reviews through a user-friendly web interface

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- GitHub account
- Anthropic API key for Claude

### Quick Installation

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
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   # Frontend
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

For detailed setup instructions, see the [Project Setup Guide](docs/PROJECT_SETUP.md).

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Project Setup and Development](docs/PROJECT_SETUP.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [GitHub Integration Guide](docs/GITHUB_INTEGRATION.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Modular Prompts Architecture](docs/MODULAR_PROMPTS.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [FAQ](docs/FAQ.md)

## Project Structure

```
.
├── backend/                  # Node.js Express API server
│   ├── deploy/               # Deployment configuration
│   ├── scripts/              # Utility scripts
│   ├── src/                  # Source code
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # API controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   └── tests/                # Test suite
├── frontend/                 # Next.js application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   ├── lib/              # Utility functions
│   │   └── types/            # TypeScript types
│   └── tests/                # Test suite
├── docs/                     # Documentation
└── .github/workflows/        # CI/CD configuration
```

## Deployment

The project can be deployed to various platforms:

### Backend

Deploy the backend to Heroku:
```bash
cd backend
./deploy/deploy-heroku.sh your-app-name
```

### Frontend

Deploy the frontend to Vercel:
```bash
cd frontend
./deploy-vercel.sh production
```

For detailed deployment instructions, see the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

## Contributing

Contributions are welcome! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Anthropic Claude for providing the AI capabilities
- The LangChain team for their excellent tooling
- All contributors who have helped shape this project