#!/usr/bin/env bash
# ============================================================
# Answer Craft — First-time setup script
# Usage: bash scripts/setup.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║     Answer Craft — Setup        ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# Check Node version
REQUIRED_NODE=18
CURRENT_NODE=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)

if [ -z "$CURRENT_NODE" ]; then
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js >= ${REQUIRED_NODE}${NC}"
  exit 1
fi

if [ "$CURRENT_NODE" -lt "$REQUIRED_NODE" ]; then
  echo -e "${RED}✗ Node.js ${CURRENT_NODE} found. Please upgrade to >= ${REQUIRED_NODE}${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js v$(node -v | sed 's/v//')${NC}"

# Install dependencies
echo -e "\n${BOLD}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create API env file
if [ ! -f "apps/api/.env.local" ]; then
  cp .env.example apps/api/.env.local
  echo -e "${GREEN}✓ Created apps/api/.env.local${NC}"
  echo -e "${YELLOW}  → Add your OPENAI_API_KEY to apps/api/.env.local${NC}"
else
  echo -e "${YELLOW}⚠ apps/api/.env.local already exists — skipping${NC}"
fi

# Create web env file
if [ ! -f "apps/web/.env.local" ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local
  echo -e "${GREEN}✓ Created apps/web/.env.local${NC}"
else
  echo -e "${YELLOW}⚠ apps/web/.env.local already exists — skipping${NC}"
fi

echo -e "\n${BOLD}${GREEN}Setup complete!${NC}"
echo -e "\n${BOLD}Next steps:${NC}"
echo -e "  1. Add your OpenAI API key to ${YELLOW}apps/api/.env.local${NC}"
echo -e "  2. Run ${YELLOW}npm run dev${NC} to start both apps"
echo -e "  3. Open ${YELLOW}http://localhost:3000${NC} in your browser"
echo -e ""
