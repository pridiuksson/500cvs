#!/bin/bash
set -e

# --- Configuration ---
PROJECT_ID="your-chosen-unique-project-id-123"
REGION="us-central1" # Or your preferred region

# --- Pre-flight Checks ---
echo "--- Checking for required tools ---"
command -v gcloud >/dev/null 2>&1 || { echo >&2 "Google Cloud SDK required but not installed. Aborting."; exit 1; }
command -v firebase >/dev/null 2>&1 || { echo >&2 "Firebase CLI required but not installed. Install via 'npm install -g firebase-tools'. Aborting."; exit 1; }

echo "--- Checking authentication status ---"
gcloud auth print-access-token --quiet >/dev/null || { echo >&2 "Not logged in to gcloud. Please run 'gcloud auth login'. Aborting."; exit 1; }
firebase login --non-interactive >/dev/null 2>&1 || { echo >&2 "Not logged in to Firebase. Please run 'firebase login'. Aborting."; exit 1; }

# 1. Project Creation & Configuration
echo "--- Setting up Google Cloud Project: $PROJECT_ID ---"
if gcloud projects list --filter="project_id=$PROJECT_ID" --format="value(project_id)" | grep -q "^$PROJECT_ID$"; then
  echo "Project $PROJECT_ID already exists. Skipping creation."
else
  gcloud projects create $PROJECT_ID --name="ai-cv-screener"
fi
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
gcloud firestore databases create --location=$REGION --type=firestore-native --quiet || echo "Firestore database already exists."

# 5. Storage Creation
echo "--- Creating Cloud Storage bucket ---"
gcloud storage buckets create gs://$PROJECT_ID-cvs --project=$PROJECT_ID --location=$REGION --quiet || echo "Cloud Storage bucket already exists."

echo "--- Infrastructure setup complete! ---"
