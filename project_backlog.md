# **Project Backlog: AI-Powered CV Screening Application**

## **0. Mission Briefing for AI Agent**

**Status:** Activated.
**Mission:** Build and deploy the "AI-Powered CV Screening Application."
**Directives:** This document is my complete operational instruction set. I will execute the Epics sequentially. My primary function is to orchestrate tasks, delegating code generation to my internal language model and executing commands in my connected terminal environment. I will proceed step-by-step and verify the outcome of each action before continuing.

**A Note for the AI Agent on Code Snippets:**
My experience has shown that directly embedding full code snippets for rapidly evolving APIs (like Genkit) can be counterproductive. While precise for stable tasks, they quickly become outdated, leading to compilation errors and prolonged debugging.

Therefore, for complex or evolving components, this backlog will provide:
1.  **Conceptual descriptions** of the required functionality.
2.  **Explicit instructions to use `google_web_search`** to find the *latest official documentation and canonical examples* for the specific APIs.
3.  **Key concepts and components** that must be present in the generated code.

For stable, foundational files (like `package.json` or `tsconfig.json`), high-fidelity snippets will still be provided, but with explicit versioning where applicable. This approach empowers you to adapt to API changes and leverage your research capabilities effectively.

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
    2.  **Configuration Variables:** Define `PROJECT_ID` and `REGION` at the top. The user will provide the `PROJECT_ID`. Exit if `PROJECT_ID` is not set or is set to a placeholder.
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
    # (I will first set the variables within the script myself)
    chmod +x 01-setup-infra.sh
    ./01-setup-infra.sh
    ```
*   **Success Criteria:** I will monitor the terminal output for success or "already exists" messages for each step. The script completes successfully when the final command exits with code 0.
*   **Troubleshooting:** If the script fails, I will examine the error messages and attempt to fix the issue. Common issues include permissions errors or the need to enable billing.

---

### **Epic 2: Application Source Code Generation**
**Goal:** Generate the complete, correct, and deployable source code for the serverless RAG application using Genkit.

#### **Agent Task 2.1: Initialize Project & Dependencies**
*   **My Task:** Initialize the local project structure, create a `.gitignore` file, and install all necessary dependencies.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # Create a .gitignore file
    echo "node_modules
lib
.DS_Store" > .gitignore

    # Create a package.json file with all dependencies
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
        "genkit": "^0.6.1",
        "@genkit-ai/googleai": "^0.6.1",
        "@genkit-ai/firebase": "^0.6.1",
        "firebase-admin": "^12.0.0",
        "firebase-functions": "^5.0.0",
        "pdf-parse": "^1.1.1",
        "zod": "^3.22.4"
      },
      "devDependencies": {
        "@types/pdf-parse": "^1.1.4",
        "@types/node": "^20.10.4",
        "typescript": "^5.3.3"
      }
    }' > package.json

    # Install all dependencies
    npm install
    ```
*   **Success Criteria:** The commands execute successfully, a `node_modules` directory is present, a `package.json` and `package-lock.json` are created, and a `.gitignore` file exists.

#### **Agent Task 2.2: Generate Core Logic and UI Files**
*   **My Task:** Generate all application source files with high-fidelity, verified code for a Genkit-based implementation.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate the following application source code files. For each file, provide a conceptual description of its purpose and key components. You MUST use `google_web_search` to find the latest official documentation and canonical examples for Genkit and Firebase APIs to ensure the generated code is correct and up-to-date.

    **File: `genkit.config.ts`**
    *   **Purpose:** Configures the Genkit environment, including plugins for Firebase and Google AI.
    *   **Key Components:** `configure` function from `genkit`, `firebase` plugin from `@genkit-ai/firebase/plugin`, `googleAI` plugin from `@genkit-ai/googleai`.
    *   **Research Directive:** Search for "Genkit configure example" and "Genkit Firebase plugin" to ensure correct import paths and usage.

    **File: `tsconfig.json`**
    *   **Purpose:** TypeScript compiler configuration for the project.
    *   **Key Components:** Standard TypeScript compiler options for Node.js ES2022 modules.
    *   **Research Directive:** Search for "TypeScript NodeNext module configuration" if unsure about the latest recommended settings.

    **File: `src/index.ts`**
    *   **Purpose:** Contains the main backend logic for the CV screening application, including PDF ingestion and natural language querying using Genkit flows.
    *   **Key Components:**
        *   Firebase Admin SDK initialization (`initializeApp`, `getStorage`, `getFirestore`).
        *   PDF parsing (`pdf-parse`).
        *   Genkit flows: `defineFlow` for `ingestCVFlow` (triggered by Cloud Storage `onObjectFinalized`) and `queryCV` (exposed as an `onFlow` HTTP callable function).
        *   Genkit AI components: `defineRetriever` for `cvRetriever` (using Firestore as a vector store), `embed` for text embeddings (using `textEmbedding` model), and `generate` for LLM responses (using `geminiPro`).
        *   Firestore Vector Store integration (`FirestoreVectorStore` from `@genkit-ai/firebase/firestore`).
        *   Zod for input/output schema validation.
    *   **Research Directive:** This is the most critical file. You MUST perform targeted `google_web_search` queries for:
        *   "Genkit RAG example Firebase Firestore"
        *   "Genkit defineFlow storage trigger"
        *   "Genkit defineRetriever FirestoreVectorStore"
        *   "Genkit embed textEmbedding"
        *   "Genkit generate geminiPro"
        *   "Firebase Functions v2 storage onObjectFinalized example"
        *   "pdf-parse npm usage example"
        *   Pay close attention to import paths, function signatures, and object structures in the latest examples.

    **File: `public/index.html`**
    *   **Purpose:** The main HTML file for the web user interface.
    *   **Key Components:** Basic HTML structure, CSS linking, input field for queries, button to trigger queries, and display areas for loading and results. Includes Firebase JS SDK imports for `firebase-app`, `firebase-functions`, and `firebase-init` (for emulator configuration).
    *   **Research Directive:** Ensure the Firebase JS SDK imports are for the latest modular version and that `firebaseConfig` is correctly loaded for emulator use.

    **File: `public/styles.css`**
    *   **Purpose:** Provides basic styling for the web user interface.
    *   **Key Components:** Simple CSS for layout, input fields, buttons, and result display.
    *   **Research Directive:** No specific research needed, standard CSS practices apply.

    **File: `public/app.js`**
    *   **Purpose:** Client-side JavaScript for handling user interaction and calling Firebase Cloud Functions.
    *   **Key Components:** Event listener for the query button, calls the `queryCV` Firebase Function using `httpsCallable`, handles loading states, and displays results. Uses modular Firebase JS SDK imports.
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
    3.  **Build:** Include the command `npm run build`.
    4.  **Deployment:** Include the command `firebase deploy --only functions,hosting`.
    5.  **Data Upload:** Include a command to upload all PDF files from a local `cv_files` directory to the `gs://$PROJECT_ID-cvs/` bucket.
    ```
*   **Verification:** I will verify the generated script contains all the correct, sequential commands.

#### **Agent Task 3.2: Execute Deployment Script**
*   **My Task:** Execute the final script to push the application live and upload the data.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # The human operator will have placed the PDFs in a directory named `cv_files` at the root of the project.
    # I will set the PROJECT_ID from my memory of Epic 1.
    export PROJECT_ID=<PROJECT_ID_FROM_EPIC_1>
    chmod +x 02-deploy-and-upload.sh
    ./02-deploy-and-upload.sh
    ```
*   **Success Criteria:** I will observe the terminal output for the public **Firebase Hosting URL** and log messages confirming the successful upload of PDF files. The mission is complete upon the successful exit of this script.
*   **Troubleshooting:** If the deployment fails, I will check the Firebase logs for more information. If the upload fails, I will ensure the `cv_files` directory exists and contains PDF files.
