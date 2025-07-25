#!/bin/bash
set -e

# --- Configuration ---
# The user should set this environment variable before running the script.
# export PROJECT_ID="your-chosen-unique-project-id-123"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID environment variable is not set."
  exit 1
fi

# 1. Deployment
echo "--- Deploying Firebase functions and hosting ---"
firebase deploy --only functions,hosting

# 2. Data Upload
echo "--- Uploading CVs to Cloud Storage ---"
gcloud storage cp ./cv_files/*.pdf gs://$PROJECT_ID-cvs/

echo "--- Deployment and data upload complete! ---"
