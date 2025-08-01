# **Project Backlog: AI-Powered CV Screening Application**

## **0. Mission Briefing for AI Agent**

**Status:** Activated.
**Mission:** Build and deploy the "AI-Powered CV Screening Application."
**Directives:** This document is my complete operational instruction set. I will execute the Epics sequentially. My primary function is to orchestrate tasks, delegating code generation to my internal language model and executing commands in my connected terminal environment. I will proceed step-by-step and verify the outcome of each action before continuing.

## **1. Operating Environment & Capabilities**

I have confirmed access to the following capabilities and will utilize them to complete this mission:

*   **Terminal Access:** I have a fully operational shell environment.
*   **Command-Line Tools:** I am authorized to use `gcloud`, `firebase`, `npm`, `npx` and standard Unix commands (`chmod`, `export`, etc.).
*   **Code Generation:** I will use my internal language model to generate source code based on precise prompts.
*   **File System I/O:** I have the ability to read and write files to the local file system (e.g., saving generated code).

## **2. Master Implementation Plan**

### **Epic 1: Project and Infrastructure Setup**
**Goal:** Establish a secure, configured, and empty foundation on Google Cloud and Firebase, ready for application deployment.

#### **Agent Task 1.1: Generate Infrastructure Script**
*   **My Task:** My primary task is to generate a shell script named `01-setup-infra.sh` that will perform the entire infrastructure setup.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a single, executable bash script named `01-setup-infra.sh`. The script must be idempotent and use shell variables for configuration. It must perform the following sequence of actions:
    1.  **Error Handling:** The script must start with `set -e` to exit immediately if a command fails.
    2.  **Configuration Variables:** Define `REGION` at the top. The script should automatically determine the `PROJECT_ID` from the active `gcloud` configuration (`gcloud config get-value project`). Exit if `PROJECT_ID` cannot be determined.
    3.  **Project Creation:** Check if the project exists. If not, create a new Google Cloud project and set it as the active gcloud configuration.
    4.  **Firebase Integration:** Check if the project is already linked to Firebase. If not, enable the Firebase service on the new project.
    5.  **API Enablement:** Programmatically enable `firestore.googleapis.com`, `storage.googleapis.com`, `aiplatform.googleapis.com`, `cloudfunctions.googleapis.com`, `cloudbuild.googleapis.com`, and `run.googleapis.com`.
    6.  **Database Creation:** Check if a Firestore database already exists. If not, create one in Native mode in the specified region.
    7.  **Storage Creation:** Check if the Cloud Storage bucket already exists. If not, create a bucket named `$PROJECT_ID-cvs`.
    ```
*   **Verification:** I will verify that the generated script contains all seven required actions and uses the correct `gcloud` and `firebase` commands with idempotency checks.

#### **Agent Task 1.2: Execute Infrastructure Script**
*   **My Task:** My next task is to execute the generated script to provision the cloud resources.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    chmod +x 01-setup-infra.sh
    ./01-setup-infra.sh
    ```
*   **Success Criteria:** I will monitor the terminal output for success or "already exists" messages for each step. The script completes successfully when the final command exits with code 0.
*   **Troubleshooting:** If the script fails, I will examine the error messages.
    *   **Billing Errors:** If the failure is due to billing not being enabled, I will execute `gcloud beta billing accounts list` to find an available billing account. Then, I will link it to the project using `gcloud beta billing projects link $PROJECT_ID --billing-account <ACCOUNT_ID>` and re-run the script.
    *   **Other Errors:** I will analyze other errors and attempt to resolve them based on the error message.

---

### **Epic 2: Application Source Code Generation**
**Goal:** Generate the complete, correct, and deployable source code for the serverless RAG application using Genkit.

#### **Agent Task 2.0: Clean Up Previous Attempts**
*   **My Task:** Remove all previously generated files and directories to ensure a clean slate for a fresh start.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    rm -rf Firebase Studio/lib
    rm -rf Firebase Studio/node_modules
    rm -f Firebase Studio/package-lock.json
    rm -f Firebase Studio/package.json
    rm -f Firebase Studio/tsconfig.json
    rm -f Firebase Studio/genkit.config.ts
    rm -f Firebase Studio/01-setup-infra.sh
    rm -f Firebase Studio/02-deploy-and-upload.sh
    rm -rf Firebase Studio/src
    rm -rf Firebase Studio/public
    ```
*   **Success Criteria:** All specified files and directories are removed.

#### **Agent Task 2.1: Initialize Project & Dependencies**
*   **My Task:** Research the latest versions of all required npm packages, then initialize the project, create a `.gitignore` file, and generate a `package.json` with the up-to-date dependencies before installing them.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # Create a .gitignore file
    echo "node_modules
lib
.DS_Store" > Firebase Studio/.gitignore

    # Research latest dependency versions
    # I will use google_web_search to find the latest stable versions for:
    # genkit, @genkit-ai/googleai, @genkit-ai/firebase, firebase-admin, 
    # firebase-functions, pdf-parse, zod, @types/pdf-parse, @types/node, typescript

    # Create a package.json file with all dependencies (using the versions I just researched)
    # For example:
    echo '{
      "name": "ai-cv-screener",
      "version": "1.0.0",
      "description": "AI-Powered CV Screening Application",
      "main": "lib/index.js",
      "scripts": {
        "build": "tsc",
        "start": "genkit start",
        "deploy": "firebase deploy --only functions,hosting"
      },
      "dependencies": {
        "genkit": "^1.15.5",
        "@genkit-ai/googleai": "^1.15.5",
        "@genkit-ai/firebase": "^1.15.5",
        "firebase-admin": "^13.4.0",
        "firebase-functions": "^6.4.0",
        "pdf-parse": "^1.1.1",
        "zod": "^4.0.14"
      },
      "devDependencies": {
        "@types/pdf-parse": "^1.1.5",
        "@types/node": "^24.1.0",
        "typescript": "^5.9.2"
      }
    }' > Firebase Studio/package.json

    # Install all dependencies
    npm install --prefix Firebase Studio
    ```
*   **Success Criteria:** The commands execute successfully, a `node_modules` directory is present within `Firebase Studio`, a `package.json` and `package-lock.json` are created with current dependency versions, and a `.gitignore` file exists.

#### **Agent Task 2.2: Generate Core Logic and UI Files**
*   **My Task:** Generate all application source files with high-fidelity, verified code for a Genkit-based implementation.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    **CRITICAL WARNING:** The Genkit and Firebase APIs are under active development and change frequently. Import paths and function signatures in online examples may be outdated. I MUST pay extremely close attention to the exact syntax provided in the *latest* official documentation and the installed `node_modules` directory. I will verify the exports of each module after installation if necessary.

    **Primary References:**
    *   Genkit Get Started: https://genkit.dev/docs/get-started/
    *   Genkit Chat with a PDF Tutorial: https://genkit.dev/docs/tutorials/tutorial-chat-with-a-pdf/

    Generate the following application source code files. For each file, provide a conceptual description of its purpose and key components.

    **File: `genkit.config.ts`**
    *   **Purpose:** Configures the Genkit environment, including plugins for Firebase and Google AI.
    *   **Key Components:** `configure` function from `genkit`, `firebase` plugin from `@genkit-ai/firebase/plugin`, `googleAI` plugin from `@genkit-ai/googleai`.
    *   **Research Directive:** Refer to the "Genkit Get Started" guide for correct `configure` and plugin usage.

    **File: `tsconfig.json`**
    *   **Purpose:** TypeScript compiler configuration for the project.
    *   **Key Components:** Standard TypeScript compiler options for Node.js ES2022 modules.
    *   **Research Directive:** Refer to the "Genkit Get Started" guide for recommended `tsconfig.json` settings.

    **File: `src/index.ts`**
    *   **Purpose:** Contains the main backend logic for the CV screening application, including PDF ingestion and natural language querying using Genkit flows.
    *   **Key Components:**
        *   Firebase Admin SDK initialization (`initializeApp`).
        *   PDF parsing (`pdf-parse`).
        *   Genkit Initialization: `const genkitApp = genkit({...});` (Note: `genkit` is a function that returns an object, and its methods like `defineFlow`, `generate`, `embed` are called on this `genkitApp` object).
        *   Genkit flows: `genkitApp.defineFlow` for `queryCV` (exposed as an `https` callable function) and a Cloud Storage trigger (`onObjectFinalized`) for `ingestCVFlow`.
        *   Genkit AI components: `defineFirestoreRetriever` (imported from `@genkit-ai/firebase/retriever`) for `cvRetriever`, `genkitApp.embed` for text embeddings, and `genkitApp.generate` for LLM responses.
        *   Zod for input/output schema validation.
        *   **IMPORTANT:** For the `queryCV` flow, I must add the `https: true` option to the `defineFlow` configuration to expose it as an HTTP callable function.
        *   **Model Naming:** Use specific model names like `googleai/gemini-pro` or `googleai/text-embedding-gecko-001` as strings when calling `genkitApp.generate` or `genkitApp.embed`.
    *   **Research Directive:** This is the most critical file. I MUST perform targeted research using the provided tutorials and inspect `node_modules` for the *latest* syntax for:
        *   Genkit RAG example with Firebase Firestore (refer to "Chat with a PDF" tutorial).
        *   `defineFirestoreRetriever` (from `@genkit-ai/firebase/retriever`).
        *   Cloud Storage trigger (`onObjectFinalized`) for Firebase Functions v2.
        *   `pdf-parse` usage.
        *   Pay close attention to import paths, function signatures, and object structures in the latest examples.

    **File: `public/index.html`**
    *   **Purpose:** The main HTML file for the web user interface.
    *   **Key Components:** Basic HTML structure, CSS linking, input field for queries, button to trigger queries, and display areas for loading and results. Includes Firebase JS SDK imports.
    *   **Research Directive:** Ensure the Firebase JS SDK imports are for the latest modular version.

    **File: `public/styles.css`**
    *   **Purpose:** Provides basic styling for the web user interface. Standard CSS practices apply.

    **File: `public/app.js`**
    *   **Purpose:** Client-side JavaScript for handling user interaction and calling Firebase Cloud Functions.
    *   **Key Components:** Event listener for the query button, calls the `queryCV` Firebase Function using `httpsCallable`.
    *   **Research Directive:** Search for "Firebase Web SDK call Cloud Function httpsCallable modular" to ensure correct API usage.
    ```
*   **Verification:** I will verify that all specified files have been created in the correct directories with the correct content based on the latest API usage found through research.

---

### **Epic 3: Deployment and Data Population**
**Goal:** Deploy the application to the cloud and populate it with the initial dataset.

#### **Agent Task 3.1: Generate Deployment Script**
*   **My Task:** Generate the final execution script.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a single, executable bash script named `02-deploy-and-upload.sh`.

    **Script Requirements:**
    1.  The script must start with `set -e`.
    2.  The script must use the `$PROJECT_ID` environment variable and exit if it's not set.
    3.  **Build:** The script MUST first change the directory to the location of the script itself (e.g., using `cd "$(dirname "$0")"`) before running `npm run build` to ensure it executes in the correct project context.
    4.  **Deployment:** Include the command `firebase deploy --only functions,hosting`.
    5.  **Data Upload:** Include a command to upload all PDF files from a local `cv_files` directory to the `gs://$PROJECT_ID-cvs/` bucket.
    ```
*   **Verification:** I will verify the generated script contains all the correct, sequential commands.

#### **Agent Task 3.2: Execute Deployment Script**
*   **My Task:** Execute the final script to push the application live and upload the data.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # The human operator will have placed the PDFs in a directory named `cv_files` at the root of the project.
    export PROJECT_ID=$(gcloud config get-value project)
    chmod +x Firebase Studio/02-deploy-and-upload.sh
    Firebase Studio/02-deploy-and-upload.sh
    ```
*   **Success Criteria:** I will observe the terminal output for the public **Firebase Hosting URL** and log messages confirming the successful upload of PDF files. The mission is complete upon the successful exit of this script.
*   **Troubleshooting:** If the deployment fails, I will first inspect the output of the `npm run build` step for any TypeScript compilation errors. I will resolve these errors in the source code before attempting to deploy again. If the upload fails, I will ensure the `cv_files` directory exists and contains PDF files.