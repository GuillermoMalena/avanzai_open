#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check if required variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: Required Supabase environment variables are not set"
  exit 1
fi

echo "Installing required dependencies..."
npm install --no-save @supabase/supabase-js node-fetch@2

echo "Running authentication test..."
node scripts/test-auth.js

# Get exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Test passed successfully!"
else
  echo "❌ Test failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE 