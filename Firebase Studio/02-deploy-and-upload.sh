#!/bin/bash
set -e

if [ -z "$PROJECT_ID" ]; then
  echo "Please set the PROJECT_ID environment variable."
  exit 1
fi

cd "$(dirname "$0")"

npm run build

firebase deploy --only functions,hosting

gsutil -m cp -r cv_files/* gs://$PROJECT_ID-cv/
