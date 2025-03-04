# Frequently Asked Questions (FAQ)

This document answers common questions about installing, configuring, and using the AI Code Review Assistant.

## General Questions

### What is the AI Code Review Assistant?

The AI Code Review Assistant is an automated tool that uses artificial intelligence to analyze code in pull requests and provide feedback on potential issues related to security, performance, code style, maintainability, and architecture.

### How does it work?

When a pull request is created or updated, the Assistant:
1. Receives a notification via webhook
2. Fetches the changed code from the repository
3. Analyzes the code for various issues
4. Generates helpful feedback
5. Posts comments on the pull request

### What kind of issues can it detect?

The AI Code Review Assistant can detect:
- **Security Issues**: SQL injection, XSS vulnerabilities, hardcoded credentials, etc.
- **Performance Issues**: Inefficient algorithms, nested loops, duplicate calculations
- **Code Style Issues**: Inconsistent naming, magic numbers, trailing console logs
- **Maintainability Issues**: Long functions, deep nesting, technical debt markers
- **Architectural Issues**: Layer violations, circular dependencies, improper abstractions

### What programming languages are supported?

Currently, the Assistant supports:
- JavaScript/TypeScript
- Python
- Java
- C#
- Go
- Ruby
- PHP

Support for additional languages can be added by extending the code analysis module.

## Setup and Configuration

### How do I set up GitHub integration?

Please see the detailed [GitHub Integration Guide](GITHUB_INTEGRATION.md) for step-by-step instructions.

### Do I need an Anthropic API key?

Yes, the AI Code Review Assistant uses Anthropic's Claude model for enhanced code analysis. You'll need to obtain an API key from Anthropic and set it in your environment configuration.

### Can I use a different AI model?

The system is designed with a modular approach, so it's possible to swap out the LLM service for a different model. However, this would require code changes to the `llmService.js` module.

### How much does it cost to run?

The cost depends on:
1. **Hosting costs**: Deploying the backend and frontend on platforms like Heroku and Vercel
2. **API usage costs**: Charges from the AI service based on your usage volume
3. **GitHub API usage**: Generally free for reasonable usage within GitHub's rate limits

### Can I run it locally without deploying to the cloud?

Yes, you can run the entire system locally for development or testing. See the [Project Setup Guide](PROJECT_SETUP.md) for instructions.

## Usage

### How do I trigger a code review?

Reviews are triggered automatically when:
- A new pull request is opened
- A pull request is updated with new commits
- A review is requested on a pull request

You can also manually trigger a review from the dashboard.

### Can I customize the severity thresholds?

Yes, you can configure severity thresholds in the settings page of the frontend application. This allows you to adjust what is considered critical, warning, or just a suggestion.

### How do I authenticate with GitHub?

The application uses GitHub OAuth for authentication. Click the "Login with GitHub" button on the login page and follow the prompts to authorize the application.

### Can I use it with private repositories?

Yes, but you'll need to:
1. Create a GitHub OAuth App with appropriate permissions
2. Configure the application to use your GitHub credentials
3. Ensure your GitHub token has access to the private repositories

### How can I ignore certain files or directories?

You can configure file exclusions in the settings page by adding patterns similar to a .gitignore file. Common patterns might include:
- `node_modules/**`
- `*.min.js`
- `dist/**`
- `build/**`

### Can I run the assistant on my entire codebase?

Currently, the AI Code Review Assistant is designed to analyze changes in pull requests rather than an entire codebase. However, you could create a PR that includes your entire codebase to get a comprehensive review.

## Performance and Limitations

### How long does a code review take?

The review time depends on:
- Size of the pull request (number of files and lines changed)
- Complexity of the code
- Current load on the backend server
- API response times from the LLM service

Typically, small to medium PRs are analyzed within 30 seconds to 2 minutes.

### Is there a limit to how large a PR can be?

Yes, there are practical limits:
- The GitHub API limits the size of payloads
- Large PRs may time out during analysis
- LLM context windows have size limitations

We recommend keeping PRs under 20 files or 1,000 lines of code for optimal performance.

### Does it work with all GitHub repositories?

The Assistant works with any GitHub repository where:
1. You have permission to install webhooks, or
2. You have read access and are using a personal access token

### How does it handle merge conflicts?

The Assistant analyzes the code as it appears in the PR. If there are merge conflicts, it will analyze the code as if those conflicts don't exist. We recommend resolving merge conflicts before expecting a meaningful review.

## Troubleshooting

### The webhook isn't receiving events from GitHub

Check the following:
1. Verify your webhook URL is correct and accessible from the internet
2. Confirm the webhook secret matches between GitHub and your backend
3. Check that you've selected the correct events (Pull requests)
4. Look at GitHub's recent deliveries panel for error details

### The AI analysis seems incorrect or incomplete

This could be due to:
1. Token limits in the LLM being reached
2. Incomplete code context provided to the LLM
3. Language-specific features that aren't properly recognized

You can try breaking down the PR into smaller chunks or customizing the prompts used for analysis.

### Authentication errors when trying to log in

Common issues include:
1. Misconfigured GitHub OAuth credentials
2. Mismatched callback URLs
3. Incorrect scopes selected for your GitHub OAuth App

### The frontend can't connect to the backend

Check the following:
1. Backend server is running and accessible
2. `NEXT_PUBLIC_BACKEND_URL` is correctly set in your frontend environment
3. CORS is properly configured on the backend
4. Network rules/firewalls allow the connection

## Future Development

### Will GitLab/Bitbucket support be added?

Yes, we plan to add support for other code platforms in future releases. The architecture is designed to make adding new integrations straightforward.

### How can I contribute to the project?

See our [Contributing Guide](CONTRIBUTING.md) for details on how to contribute code, documentation, or report issues.

### Are there plans for additional features?

We're working on several enhancements:
- Integration with more code quality tools
- Support for more programming languages
- Custom rule creation
- Team collaboration features
- Historical analytics on code quality