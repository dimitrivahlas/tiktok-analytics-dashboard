#!/bin/bash

# Ensure this script is executable: chmod +x push-to-github.sh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== TikTok Analytics Dashboard - GitHub Push Script =====${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Ask for GitHub username if not already set
if [ -z "$(git config --get user.name)" ]; then
    echo -e "${YELLOW}Enter your GitHub username:${NC}"
    read github_username
    git config --global user.name "$github_username"
fi

# Ask for GitHub email if not already set
if [ -z "$(git config --get user.email)" ]; then
    echo -e "${YELLOW}Enter your GitHub email:${NC}"
    read github_email
    git config --global user.email "$github_email"
fi

# Prompt for repository URL
echo -e "${YELLOW}Enter your GitHub repository URL (https://github.com/username/repository.git):${NC}"
read repo_url

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
    echo -e "${GREEN}Initializing Git repository...${NC}"
    git init
fi

# Remove existing remote if any
git remote remove origin 2>/dev/null

# Add the new remote
echo -e "${GREEN}Adding remote repository...${NC}"
git remote add origin "$repo_url"

# Stage all files
echo -e "${GREEN}Staging files...${NC}"
git add .

# Commit changes
echo -e "${GREEN}Committing changes...${NC}"
git commit -m "Initial commit: TikTok Analytics Dashboard"

# Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}Repository URL: ${repo_url}${NC}"
else
    echo -e "${RED}Failed to push to GitHub. Please check your credentials and repository URL.${NC}"
    echo -e "${YELLOW}If you're using HTTPS, you might need to enter your GitHub credentials.${NC}"
    echo -e "${YELLOW}If you're still having issues, try pushing manually:${NC}"
    echo -e "  git push -u origin main"
fi