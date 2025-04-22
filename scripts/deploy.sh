#!/bin/bash

# Build the Move package
sui move build

# Deploy to testnet
sui client publish --gas-budget 1000000000

# Get the package ID from the deployment
PACKAGE_ID=$(sui client publish --gas-budget 1000000000 --json | jq -r '.effects.created[0].reference.objectId')

# Update the package ID in the demo app
sed -i '' "s/YOUR_PACKAGE_ID/$PACKAGE_ID/g" demo-app/src/App.tsx

echo "Package deployed with ID: $PACKAGE_ID"
echo "Updated demo app with new package ID" 