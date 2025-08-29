#!/bin/bash

# Set SendGrid environment variables (for local development only)
# In production, these should be set in the deployment platform
export SENDGRID_API_KEY="${SENDGRID_API_KEY:-your-sendgrid-api-key-here}"
export SENDGRID_FROM_EMAIL="${SENDGRID_FROM_EMAIL:-noreply@remodely.ai}"
export SENDGRID_FROM_NAME="${SENDGRID_FROM_NAME:-Remodely CRM}"

echo "✅ SendGrid environment variables configured"
echo "Starting CRM development server with email functionality..."

# Run the development server
exec ./start-dev-robust.sh
