# **Project Backlog: AI-Powered CV Screening Application**

## **0. Mission Briefing for AI Agent**

**Status:** Activated.
**Mission:** Build and deploy the "AI-Powered CV Screening Application."
**Directives:** This document is my complete operational instruction set. I will execute the Epics sequentially. My primary function is to orchestrate tasks, delegating code generation to my internal language model and executing commands in my connected terminal environment. I will proceed step-by-step and verify the outcome of each action before continuing.

## **1. Operating Environment & Capabilities**

I have confirmed access to the following capabilities and will utilize them to complete this mission:

*   **Terminal Access:** I have a fully operational shell environment.
*   **Command-Line Tools:** I am authorized to use `gcloud`, `firebase`, `npm`, and standard Unix commands (`chmod`, `export`, etc.).
*   **Code Generation:** I will use my internal language model to generate source code based on precise prompts.
*   **File System I/O:** I have the ability to read and write files to the local file system (e.g., saving generated code).

## **2. Master Implementation Plan**

### **Epic 1: Infrastructure Provisioning**
**Goal:** Establish a secure, configured, and empty foundation on Google Cloud and Firebase, ready for application deployment.

#### **Agent Task 1.1: Generate Infrastructure Script**
*   **My Task:** My primary task is to generate a shell script named `01-setup-infra.sh` that will perform the entire infrastructure setup.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a single, executable bash script named `01-setup-infra.sh`. The script must be idempotent where possible and use shell variables for configuration. It must perform the following sequence of actions:
    1.  **Configuration Variables:** Define `PROJECT_ID` and `REGION` at the top.
    2.  **Project Creation:** Create a new Google Cloud project and set it as the active gcloud configuration.
    3.  **Firebase Integration:** Enable the Firebase service on the new project.
    4.  **API Enablement:** Programmatically enable `firestore.googleapis.com`, `storage.googleapis.com`, `aiplatform.googleapis.com`, `cloudfunctions.googleapis.com`, `cloudbuild.googleapis.com`, and `run.googleapis.com`.
    5.  **Database Creation:** Create a Firestore database in Native mode. Use the `--location` flag for specifying the region.
    6.  **Storage Creation:** Create a Cloud Storage bucket named `$PROJECT_ID-cvs`.
    ```
*   **Verification:** I will verify that the generated script contains all six required actions and uses the correct `gcloud` and `firebase` commands as specified.

#### **Agent Task 1.2: Execute Infrastructure Script**
*   **My Task:** My next task is to execute the generated script to provision the cloud resources.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # (I will first set the variables within the script myself)
    chmod +x 01-setup-infra.sh
    ./01-setup-infra.sh
    ```
*   **Success Criteria:** I will monitor the terminal output for success messages for each step. The script completes successfully when the final command exits with code 0.

---

### **Epic 2: Application Source Code Generation**
**Goal:** Generate the complete, correct, and deployable source code for the serverless RAG application.

#### **Agent Task 2.1: Initialize Project & Dependencies**
*   **My Task:** Initialize the local project structure and link it to the newly created Firebase project.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # I will select "Firebase" as the platform and "Google AI" as the model provider.
    genkit init

    # I will set the PROJECT_ID from Epic 1 here.
    firebase use <PROJECT_ID_FROM_EPIC_1>

    npm install langchain-google-genai @langchain/community @langchain/core pdf-parse
    ```
*   **Success Criteria:** The commands execute successfully, a `node_modules` directory is present, and `.firebaserc` file contains the correct `PROJECT_ID`.

#### **Agent Task 2.2: Generate Core Logic and UI Files**
*   **My Task:** Generate all application source files with high-fidelity, verified code.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a complete set of application source code files. Use the following file paths and content as high-fidelity templates. Ensure the code is modern, secure, and idiomatic for Firebase Gen2 Functions and Genkit.

    **File: `genkit.config.ts`**
    ```typescript
    import { googleAI } from '@genkit-ai/google-ai';
    import { firebase } from '@genkit-ai/firebase';
    import { configureGenkit } from '@genkit-ai/core';

    export default configureGenkit({
      plugins: [googleAI(), firebase()],
      logLevel: 'debug',
      enableTracingAndMetrics: true,
    });
    ```

    **File: `src/rag.ts`**
    ```typescript
    import { generate } from '@genkit-ai/ai/model';
    import { defineRetriever, retrieve } from '@genkit-ai/ai/retriever';
    import { geminiPro } from '@genkit-ai/google-ai';
    import { GoogleAIEmbeddings } from 'langchain-google-genai';
    import { FirestoreVectorStore } from '@langchain/community/vectorstores/firestore';

    export const cvRetriever = defineRetriever({ name: 'cv-firestore-retriever' }, async (query) => {
      const firestore = new FirestoreVectorStore(new GoogleAIEmbeddings());
      return { documents: await firestore.similaritySearch(query, 4) };
    });

    export async function answerCVQuery(query: string) {
      const context = await retrieve({ retriever: cvRetriever, query });
      const llmResponse = await generate({
        model: geminiPro,
        prompt: `You are an expert HR assistant. Based ONLY on the following CV excerpts, answer the user's question. If the context does not contain the answer, state that you cannot find the information.

          CONTEXT:
          ${context.documents.map(doc => doc.pageContent).join('\n---\n')}

          QUESTION: ${query}`,
      });
      return llmResponse.text();
    }
    ```

    **File: `src/index.ts`**
    ```typescript
    import { https, storage } from 'firebase-functions/v2';
    import { initializeApp } from 'firebase-admin/app';
    import { getFirestore } from 'firebase-admin/firestore';
    import { getStorage } from 'firebase-admin/storage';
    import { GoogleAIEmbeddings } from 'langchain-google-genai';
    import { FirestoreVectorStore } from '@langchain/community/vectorstores/firestore';
    import { Document } from '@langchain/core/documents';
    import * as pdfparse from 'pdf-parse';
    import { answerCVQuery } from './rag';
    
    initializeApp();

    export const queryCV = https.onCall(async (request) => {
      const query = request.data.query as string;
      if (!query) throw new https.HttpsError('invalid-argument', 'Query text must be provided.');
      return { answer: await answerCVQuery(query) };
    });

    export const ingestCV = storage.object().onFinalize(async (object) => {
      if (!object.name || !object.name.endsWith('.pdf')) return;
      const file = getStorage().bucket(object.bucket).file(object.name);
      const [fileBuffer] = await file.download();
      const pdfData = await pdfparse(fileBuffer);
      const vectorStore = new FirestoreVectorStore(new GoogleAIEmbeddings(), { firestore: getFirestore() });
      await vectorStore.addDocuments(
        [new Document({ pageContent: pdfData.text, metadata: { source: object.name } })]
      );
      console.log(`Indexed ${object.name}.`);
    });
    ```
    
    **File: `public/app.js`, `public/index.html`, `public/styles.css`**

    Generate a professional, user-friendly frontend. The JavaScript must use the Firebase v9+ SDK to call the `queryCV` function, manage loading states, and display the result.

    
*   **Verification:** I will verify that all specified files have been created in the correct directories with the exact content prescribed.

---

### **Epic 3: Deployment and Data Population**
**Goal:** Deploy the application to the cloud and populate it with the initial dataset.

#### **Agent Task 3.1: Generate Deployment Script**
*   **My Task:** Generate the final execution script.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a single, executable bash script named `02-deploy-and-upload.sh`.

    **Script Requirements:**
    1.  The script must use the `$PROJECT_ID` environment variable.
    2.  **Deployment:** Include the command `firebase deploy --only functions,hosting`.
    3.  **Data Upload:** Include the command `gcloud storage cp ./cv_files/*.pdf gs://$PROJECT_ID-cvs/`.
    ```
*   **Verification:** I will verify the generated script contains the two correct, sequential commands.

#### **Agent Task 3.2: Execute Deployment Script**
*   **My Task:** Execute the final script to push the application live and upload the data.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # The human operator will have placed the PDFs in ./cv_files/
    # I will set the PROJECT_ID from my memory of Epic 1.
    export PROJECT_ID=<PROJECT_ID_FROM_EPIC_1>
    chmod +x 02-deploy-and-upload.sh
    ./02-deploy-and-upload.sh
    ```
*   **Success Criteria:** I will observe the terminal output for the public **Firebase Hosting URL** and log messages confirming the successful upload of PDF files. The mission is complete upon the successful exit of this script.
