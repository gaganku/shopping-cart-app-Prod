#!/bin/bash
# ModernShop - Automated Setup Script for Unix/Mac

echo "=========================================="
echo "ModernShop - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking Node.js installation..."
if command -v node &> /dev/null
then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
echo "Checking npm installation..."
if command -v npm &> /dev/null
then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm is installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

# Check if MongoDB is installed
echo "Checking MongoDB installation..."
if command -v mongod &> /dev/null
then
    echo -e "${GREEN}✓ MongoDB is installed${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB is not installed or not in PATH${NC}"
    echo "You can install MongoDB from https://www.mongodb.com/try/download/community"
    echo "Or use MongoDB Atlas (cloud) instead"
fi

echo ""
echo "Installing npm dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from template..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ Please update .env with your configuration${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start MongoDB: sudo systemctl start mongod"
echo "3. Run the application: npm start"
echo ""
echo "The application will be available at: http://localhost:3000"
echo ""
