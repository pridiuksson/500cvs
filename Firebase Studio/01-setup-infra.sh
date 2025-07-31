#!/bin/bash
set -e

# 1. Configuration
# The user will need to set this variable before running the script.
PROJECT_ID="cv-screener-app-fb"
REGION="us-central1" # Or your preferred region

# Exit if PROJECT_ID is not set or is a placeholder
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "your-gcp-project-id-here" ]; then
  echo "Error: PROJECT_ID is not set. Please edit the script and provide your Google Cloud Project ID."
  exit 1
fi

echo "Using Project ID: $PROJECT_ID"
echo "Using Region: $REGION"

# 2. Create and Set Project
echo "Checking for project..."
if ! gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
  echo "Creating Google Cloud project: $PROJECT_ID"
  gcloud projects create $PROJECT_ID
else
  echo "Project $PROJECT_ID already exists."
fi
gcloud config set project $PROJECT_ID

# 3. Link to Firebase
echo "Linking project to Firebase..."
if ! firebase projects:list | grep -q "$PROJECT_ID"; then
  echo "Adding Firebase to project $PROJECT_ID."
  firebase projects:addfirebase $PROJECT_ID
else
  echo "Project is already associated with Firebase."
fi

# 4. Enable APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable firestore.googleapis.com \
    storage.googleapis.com \
    aiplatform.googleapis.com \
    cloudfunctions.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com

# 5. Create Firestore Database
echo "Creating Firestore database..."
if ! gcloud firestore databases describe --project=$PROJECT_ID --database='(default)' >/dev/null 2>&1; then
    gcloud firestore databases create --location=$REGION --type=firestore-native --project=$PROJECT_ID
else
    echo "Firestore database already exists."
fi

# 6. Create Cloud Storage Bucket
echo "Creating Cloud Storage bucket..."
BUCKET_NAME="$PROJECT_ID-cvs"
if ! gcloud storage buckets describe gs://$BUCKET_NAME/ >/dev/null 2>&1; then
    gcloud storage buckets create gs://$BUCKET_NAME --project=$PROJECT_ID --location=$REGION
else
    echo "Bucket gs://$BUCKET_NAME already exists."
fi

echo "Infrastructure setup complete for project $PROJECT_ID."