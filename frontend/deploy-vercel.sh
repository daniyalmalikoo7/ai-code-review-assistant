#!/bin/bash

# Vercel deployment script for frontend
# Usage: ./deploy-vercel.sh [production]

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Please install it first with: npm i -g vercel"
    exit 1
fi

# Check if logged in to Vercel
vercel whoami || (echo "Please log in to Vercel first using 'vercel login'" && exit 1)

# Set environment variable for backend URL
read -p "Enter backend URL (e.g., https://ai-code-review-backend.herokuapp.com): " BACKEND_URL
vercel env add NEXT_PUBLIC_BACKEND_URL production $BACKEND_URL

# Check if we're deploying to production
if [ "$1" == "production" ]; then
    echo "Deploying to production..."
    vercel --prod
else
    echo "Deploying to preview environment..."
    vercel
fi

echo "Frontend deployment to Vercel complete!"