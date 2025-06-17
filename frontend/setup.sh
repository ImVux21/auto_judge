#!/bin/bash

# Exit on error
set -e

echo "Setting up AutoJudge frontend monorepo..."

# First, install dependencies for core package
echo "Setting up core library..."
cd packages/core
pnpm install --ignore-scripts
cd ../..

# Then, install dependencies for UI package
echo "Setting up UI library..."
cd packages/ui
pnpm install --ignore-scripts
cd ../..

# Build core library
echo "Building core library..."
pnpm --filter @autojudge/core build

# Build UI library
echo "Building UI library..."
pnpm --filter @autojudge/ui build

# Now install main app dependencies
echo "Installing main app dependencies..."
cd packages/main
pnpm install
cd ../..

echo "Setup complete! You can now run 'pnpm start' to start the application." 