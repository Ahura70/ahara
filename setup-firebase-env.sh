#!/bin/bash

# Firebase Environment Setup Script
# Usage: ./setup-firebase-env.sh <apiKey> <authDomain> <databaseURL> <projectId> <storageBucket> <messagingSenderId> <appId>

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if all required arguments are provided
if [ $# -ne 7 ]; then
    echo -e "${RED}Error: Missing arguments!${NC}"
    echo ""
    echo "Usage: ./setup-firebase-env.sh <apiKey> <authDomain> <databaseURL> <projectId> <storageBucket> <messagingSenderId> <appId>"
    echo ""
    echo "Example:"
    echo "./setup-firebase-env.sh \\"
    echo "  'AIzaSyAGbbpNiEfkK6kWowU4or7DzRis8u1m47Y' \\"
    echo "  'ahara-ai.firebaseapp.com' \\"
    echo "  'https://ahara-ai-default-rtdb.firebaseio.com' \\"
    echo "  'ahara-ai' \\"
    echo "  'ahara-ai.appspot.com' \\"
    echo "  '123456789012' \\"
    echo "  '1:123456789012:web:abcdef1234567890'"
    exit 1
fi

# Assign arguments to variables
API_KEY=$1
AUTH_DOMAIN=$2
DATABASE_URL=$3
PROJECT_ID=$4
STORAGE_BUCKET=$5
MESSAGING_SENDER_ID=$6
APP_ID=$7

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# File paths
ENV_LOCAL="$SCRIPT_DIR/.env.local"
ENV_PRODUCTION="$SCRIPT_DIR/.env.production"

echo -e "${YELLOW}Setting up Firebase environment variables...${NC}"
echo ""

# Create or update .env.local
echo -e "${GREEN}Updating .env.local${NC}"
cat > "$ENV_LOCAL" << EOF
# Gemini API Configuration
VITE_GEMINI_API_KEY="AIzaSyAGbbpNiEfkK6kWowU4or7DzRis8u1m47Y"

# App URL
VITE_APP_URL="http://localhost:5173"

# Firebase Configuration
VITE_FIREBASE_API_KEY="$API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN"
VITE_FIREBASE_DATABASE_URL="$DATABASE_URL"
VITE_FIREBASE_PROJECT_ID="$PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="$MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="$APP_ID"
EOF

echo -e "${GREEN}✓ Created $ENV_LOCAL${NC}"

# Create .env.production (same values for Vercel, but will override with env vars)
echo -e "${GREEN}Updating .env.production${NC}"
cat > "$ENV_PRODUCTION" << EOF
# Production Environment Variables
# These will be overridden by Vercel environment variables
# Add these to Vercel Dashboard > Settings > Environment Variables:

VITE_FIREBASE_API_KEY="$API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN"
VITE_FIREBASE_DATABASE_URL="$DATABASE_URL"
VITE_FIREBASE_PROJECT_ID="$PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="$MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="$APP_ID"
EOF

echo -e "${GREEN}✓ Created $ENV_PRODUCTION${NC}"
echo ""

# Display Vercel configuration instructions
echo -e "${YELLOW}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Firebase Setup Complete!${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next Steps for Vercel Deployment:${NC}"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your 'ahara' project"
echo "3. Click Settings > Environment Variables"
echo "4. Add these 7 variables (copy-paste from below):"
echo ""
echo -e "${GREEN}VITE_FIREBASE_API_KEY${NC}=$API_KEY"
echo -e "${GREEN}VITE_FIREBASE_AUTH_DOMAIN${NC}=$AUTH_DOMAIN"
echo -e "${GREEN}VITE_FIREBASE_DATABASE_URL${NC}=$DATABASE_URL"
echo -e "${GREEN}VITE_FIREBASE_PROJECT_ID${NC}=$PROJECT_ID"
echo -e "${GREEN}VITE_FIREBASE_STORAGE_BUCKET${NC}=$STORAGE_BUCKET"
echo -e "${GREEN}VITE_FIREBASE_MESSAGING_SENDER_ID${NC}=$MESSAGING_SENDER_ID"
echo -e "${GREEN}VITE_FIREBASE_APP_ID${NC}=$APP_ID"
echo ""
echo "5. Click 'Save'"
echo "6. Go to Deployments > Click '...' on latest > 'Redeploy'"
echo "7. Wait for deployment to complete"
echo ""

# Test configuration
echo -e "${YELLOW}Testing configuration...${NC}"
if [ -f "$ENV_LOCAL" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    echo "  Contents:"
    grep -E "FIREBASE" "$ENV_LOCAL" | sed 's/^/    /'
else
    echo -e "${RED}✗ .env.local not found${NC}"
fi

echo ""
echo -e "${GREEN}Local development setup complete!${NC}"
echo "Run 'npm run dev' to test locally with Firebase authentication."
