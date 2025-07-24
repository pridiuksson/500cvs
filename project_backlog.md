# **Mission Statement for the Orchestrator Agent**
**Attention Orchestrator:** You are the "hands" of this operation. Your primary role is to execute commands in the terminal and manage the workflow. You will delegate code and script generation tasks to a specialized **AI Code Generator** (e.g., Gemini CLI) by providing it with precise prompts defined in this document. After the AI generates an artifact (a script or source code), your job is to execute or save it as instructed.

This document is your master plan. Follow it sequentially.

### **Workflow Model**
1.  Read an **Orchestrator Action**.
2.  Perform the **[Delegation]** step by sending the provided prompt to the AI Code Generator.
3.  Perform the **[Execution]** step by running the specified commands in your terminal, using the artifacts generated in the previous step.

## **Prerequisites for the Execution Environment**
Before beginning, ensure the following command-line tools are installed and authenticated in your environment:
1.  **Google Cloud SDK (`gcloud`)**: Authenticated via `gcloud auth login`.
2.  **Firebase CLI (`firebase-tools`)**: Authenticated via `firebase login`.
3.  **Node.js**: Version 20 or higher.

## **Implementation Plan**

### **Epic 1: Project and Infrastructure Setup**
**Goal:** Create and configure all necessary cloud infrastructure programmatically.

#### **Orchestrator Action 1.1: Generate and Execute the Infrastructure Script**

**[Delegation]**
Provide the following prompt to your designated AI Code Generator:
```prompt
Act as an expert Google Cloud engineer. Your task is to generate a single, executable bash script named `01-setup-infra.sh`. This script must perform all actions listed below. The script must be idempotent where possible and use shell variables for configuration. Do not add any conversational text.

**Script Requirements:**
1.  **Configuration Variables:** Define `PROJECT_ID` and `REGION` at the top of the script.
2.  **Project Creation:** Create a new Google Cloud project and set it as the active gcloud configuration.
3.  **Firebase Integration:** Enable the Firebase service on the new project.
4.  **API Enablement:** Programmatically enable the following APIs: `firestore.googleapis.com`, `storage.googleapis.com`, `aiplatform.googleapis.com`, `cloudfunctions.googleapis.com`, `cloudbuild.googleapis.com`, and `run.googleapis.com`.
5.  **Database Creation:** Create a Firestore database in Native mode. Use the `--location` flag for specifying the region.
6.  **Storage Creation:** Create a Cloud Storage bucket named `$PROJECT_ID-cvs`.
```

**[Execution]**
1.  Save the generated script as `01-setup-infra.sh`.
2.  Set the `PROJECT_ID` and `REGION` variables in the script.
3.  Make the script executable: `chmod +x 01-setup-infra.sh`.
4.  Execute the script: `./01-setup-infra.sh`.
5.  Verify successful completion by observing the script's output.

---

### **Epic 2: Genkit Application Development**
**Goal:** Generate the complete source code for the serverless application using the Genkit framework.

#### **Orchestrator Action 2.1: Generate Application Source Code**

**[Delegation]**
Provide the following prompt to your designated AI Code Generator:
```prompt
Act as an expert Genkit and Firebase developer. Your task is to generate the complete source code for a new Node.js project in the current directory. You will generate multiple files as specified below, providing the complete content for each file.

**1. File: `package.json`**
Generate a `package.json` file with all necessary dependencies, including `@genkit-ai/core`, `@genkit-ai/firebase`, `@genkit-ai/google-ai`, `firebase-admin`, `firebase-functions`, `@langchain/community`, `langchain-google-genai`, `@langchain/core`, and `pdf-parse`. Include `dev` dependencies for TypeScript and other build tools.

**2. File: `genkit.config.ts`**
Generate a `genkit.config.ts` file that correctly configures the `googleAI` and `firebase` plugins.

**3. File: `src/rag.ts`**
Generate the core RAG logic. This file must define and export:
- A `cvRetriever` using `defineRetriever`. This retriever must use a `FirestoreVectorStore` from `@langchain/community/vectorstores/firestore` and `GoogleAIEmbeddings`.
- An `answerCVQuery` async function that accepts a query string. This function must use the `cvRetriever`, then call `generate` on the `geminiPro` model with a detailed prompt that instructs it to answer *only* based on the provided context.

**4. File: `src/index.ts`**
Generate the main entry point for Firebase Functions. This file must:
- Initialize the `firebase-admin` app.
- Define and export an HTTPS callable function `queryCV` that calls the `answerCVQuery` function from `rag.ts`.
- Define and export a Cloud Storage triggered function `ingestCV` that activates on new PDF uploads. This function must:
    - Download the PDF file buffer.
    - Use the `pdf-parse` library to extract text.
    - Initialize the `FirestoreVectorStore`.
    - Use the vector store's `.addDocuments()` method to process and store the text chunks as LangChain `Document` objects.

**5. File: `public/index.html`**
Generate a clean HTML structure with a title, a search input, a button, and containers for loading and results.

**6. File: `public/app.js` and `public/styles.css`**
Generate the necessary JavaScript to call the `queryCV` Firebase Function (using the Firebase JS v9+ SDK) and CSS for a professional UI.
```

**[Execution]**
1.  Save each piece of generated code into its respective file (e.g., `package.json`, `src/index.ts`, etc.).
2.  Install the project dependencies: `npm install`.

---

### **Epic 3: Deployment and Data Population**
**Goal:** Deploy the generated application and upload the initial set of user data.

#### **Orchestrator Action 3.1: Generate and Execute the Deployment Script**

**[Delegation]**
Provide the following prompt to your designated AI Code Generator:
```prompt
Act as an expert cloud engineer. Your task is to generate a single, executable bash script named `02-deploy-and-upload.sh`.

**Script Requirements:**
1.  The script must use the `$PROJECT_ID` environment variable.
2.  **Deployment Command:** Include the command to deploy all Firebase Functions and Firebase Hosting resources. Use the `--only` flag for precision.
3.  **Data Upload Command:** Include the command to recursively copy all PDF files from a local directory named `./cv_files/` to the root of the Cloud Storage bucket (`gs://$PROJECT_ID-cvs/`). Use the `gcloud storage cp` command.
```

**[Execution]**
1.  Save the generated script as `02-deploy-and-upload.sh`.
2.  Make the script executable: `chmod +x 02-deploy-and-upload.sh`.
3.  Set the environment variable: `export PROJECT_ID=<your-project-id>`.
4.  Execute the script: `./02-deploy-and-upload.sh`.
5.  Confirm successful deployment by checking the Hosting URL provided in the output.
