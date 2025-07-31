#!/bin/bash
set -e

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID environment variable is not set."
  exit 1
fi

npm run build
firebase deploy --only functions,hosting
gcloud storage cp ./cv_files/*.pdf gs://$PROJECT_ID-cvs/