#!/bin/bash
set -e

# --- Configuration ---
PROJECT_ID="your-chosen-unique-project-id-123"
REGION="us-central1" # Or your preferred region

# 1. Project Creation & Configuration
echo "--- Setting up Google Cloud Project: $PROJECT_ID ---"
gcloud projects create $PROJECT_ID --name="ai-cv-screener"
gcloud config set project $PROJECT_ID

# 2. Firebase Integration
echo "--- Enabling Firebase on the project ---"
firebase projects:addfirebase $PROJECT_ID

# 3. API Enablement
echo "--- Enabling necessary Google Cloud APIs ---"
gcloud services enable firestore.googleapis.com \
                        storage.googleapis.com \
                        aiplatform.googleapis.com \
                        cloudfunctions.googleapis.com \
                        cloudbuild.googleapis.com \
                        run.googleapis.com

# 4. Database Creation
echo "--- Creating Firestore Native database ---"
gcloud firestore databases create --location=$REGION --type=firestore-native

# 5. Storage Creation
echo "--- Creating Cloud Storage bucket ---"
gcloud storage buckets create gs://$PROJECT_ID-cvs --project=$PROJECT_ID --location=$REGION

echo "--- Infrastructure setup complete! ---"
