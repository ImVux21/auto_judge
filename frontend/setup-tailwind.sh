#!/bin/bash

# Install dependencies
npm install

# Generate Tailwind CSS config if it doesn't exist already
if [ ! -f "tailwind.config.js" ]; then
  npx tailwindcss init
fi

# Build the project
npm run build

echo "Tailwind CSS has been set up successfully!"
echo "Run 'npm start' to start the development server." 