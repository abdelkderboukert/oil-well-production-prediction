#!/bin/bash

# Oil Well Production Prediction - Docker Registry Guide
# This script demonstrates how to authenticate with GitHub Container Registry
# and pull/run the pre-built Docker images.

set -e

echo "=========================================="
echo "Docker Registry Authentication & Usage"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
REPOSITORY="abdelkderboukert/oil-well-production-prediction"
IMAGE_MAIN="${REGISTRY}/${REPOSITORY}:main"
IMAGE_DEV="${REGISTRY}/${REPOSITORY}:development"

echo -e "${YELLOW}Step 1: Generate GitHub Personal Access Token${NC}"
echo "1. Go to https://github.com/settings/tokens/new"
echo "2. Select scopes: read:packages"
echo "3. Generate and copy the token"
echo ""

# Authentication
PAT=${1:-}
if [ -z "$PAT" ]; then
    echo -e "${RED}Usage: $0 <github_pat_token>${NC}"
    echo "Example: $0 ghp_xxxxxxxxxxxxxxxxxxxx"
    echo ""
    echo -e "${YELLOW}Or manually authenticate:${NC}"
    echo "echo 'YOUR_GITHUB_TOKEN' | docker login ghcr.io -u YOUR_USERNAME --password-stdin"
    echo ""
    exit 1
fi

USERNAME=${2:-"$(git config user.name)"}

echo -e "${YELLOW}Step 2: Logging in to GitHub Container Registry${NC}"
echo "Authenticating with ghcr.io..."
echo "${PAT}" | docker login ${REGISTRY} -u "${USERNAME}" --password-stdin

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully authenticated with ${REGISTRY}${NC}"
else
    echo -e "${RED}✗ Authentication failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Available Images${NC}"
echo "Main branch (stable):     ${IMAGE_MAIN}"
echo "Development branch:       ${IMAGE_DEV}"
echo ""

echo -e "${YELLOW}Step 4: Pulling Image${NC}"
echo "Pulling ${IMAGE_MAIN}..."
docker pull ${IMAGE_MAIN}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully pulled image${NC}"
else
    echo -e "${RED}✗ Failed to pull image${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Running Container${NC}"
echo "Starting container..."

# Create necessary directories
mkdir -p data/processed models plots reports

docker run --rm \
  --name oil-well-prediction \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/config:/app/config" \
  -v "$(pwd)/models:/app/models" \
  -v "$(pwd)/plots:/app/plots" \
  -v "$(pwd)/reports:/app/reports" \
  ${IMAGE_MAIN}

echo -e "${GREEN}✓ Pipeline execution completed${NC}"
echo ""
echo -e "${YELLOW}Output directories:${NC}"
echo "  - Models: ./models/"
echo "  - Plots: ./plots/"
echo "  - Reports: ./reports/"
