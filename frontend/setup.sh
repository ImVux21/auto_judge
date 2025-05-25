#!/bin/bash

# Make the script executable
chmod +x setup.sh

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm and try again."
    exit 1
fi

# Install Angular CLI globally if not already installed
if ! command -v ng &> /dev/null; then
    echo "Installing Angular CLI..."
    npm install -g @angular/cli
fi

# Create new Angular workspace
echo "Creating Angular workspace..."
ng new autojudge-frontend --directory . --routing true --style css --skip-git --skip-tests --skip-install

# Install dependencies
echo "Installing dependencies..."
npm install
npm install tailwindcss @tailwindcss/forms postcss autoprefixer --save-dev

# Initialize Tailwind CSS
echo "Initializing Tailwind CSS..."
npx tailwindcss init

echo "Setup complete! You can now run 'npm start' to start the development server." 