#!/bin/bash

# Heroku deployment script for backend
# Usage: ./deploy-heroku.sh [app-name]

APP_NAME=${1:-"ai-code-review-backend"}
HEROKU_REMOTE="heroku-backend"

echo "Deploying backend to Heroku app: $APP_NAME"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "Heroku CLI not found. Please install it first."
    exit 1
fi

# Check if logged in to Heroku
heroku whoami || (echo "Please log in to Heroku first using 'heroku login'" && exit 1)

# Create Heroku app if it doesn't exist
heroku apps:info --app $APP_NAME > /dev/null 2>&1 || heroku create $APP_NAME

# Add Heroku remote if it doesn't exist
if ! git remote | grep -q "$HEROKU_REMOTE"; then
    git remote add $HEROKU_REMOTE https://git.heroku.com/$APP_NAME.git
fi

# Set environment variables
echo "Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set JWT_SECRET=$(openssl rand -hex 32) --app $APP_NAME
# Note: You should set these values manually for security reasons
echo "Please set these environment variables manually:"
echo "heroku config:set ANTHROPIC_API_KEY=your_anthropic_api_key --app $APP_NAME"
echo "heroku config:set GITHUB_WEBHOOK_SECRET=your_github_webhook_secret --app $APP_NAME"
echo "heroku config:set GITHUB_CLIENT_ID=your_github_client_id --app $APP_NAME"
echo "heroku config:set GITHUB_CLIENT_SECRET=your_github_client_secret --app $APP_NAME"
echo "heroku config:set FRONTEND_URL=your_frontend_url --app $APP_NAME"

# Deploy to Heroku
echo "Deploying to Heroku..."
git subtree push --prefix backend $HEROKU_REMOTE main || (echo "Failed to push to Heroku. If you're not in the root directory, try: git push $HEROKU_REMOTE \`git subtree split --prefix backend main\`:main")

echo "Backend deployment to Heroku complete!"
echo "Your API is now available at: https://$APP_NAME.herokuapp.com"