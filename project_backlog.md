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

### **Epic 1: Project and Infrastructure Setup**
**Goal:** Establish a secure, configured, and empty foundation on Google Cloud and Firebase, ready for application deployment.

#### **Agent Task 1.1: Generate Infrastructure Script**
*   **My Task:** My primary task is to generate a shell script named `01-setup-infra.sh` that will perform the entire infrastructure setup.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a single, executable bash script named `01-setup-infra.sh`. The script must be idempotent where possible and use shell variables for configuration. It must perform the following sequence of actions:
    1.  **Error Handling:** The script must start with `set -e` to exit immediately if a command fails.
    2.  **Configuration Variables:** Define `PROJECT_ID` and `REGION` at the top. The user will provide the `PROJECT_ID`.
    3.  **Project Creation:** Create a new Google Cloud project and set it as the active gcloud configuration.
    4.  **Firebase Integration:** Enable the Firebase service on the new project.
    5.  **API Enablement:** Programmatically enable `firestore.googleapis.com`, `storage.googleapis.com`, `aiplatform.googleapis.com`, `cloudfunctions.googleapis.com`, `cloudbuild.googleapis.com`, and `run.googleapis.com`.
    6.  **Database Creation:** Create a Firestore database in Native mode. Use the `--location` flag for specifying the region.
    7.  **Storage Creation:** Create a Cloud Storage bucket named `$PROJECT_ID-cvs`.
    ```
*   **Verification:** I will verify that the generated script contains all seven required actions and uses the correct `gcloud` and `firebase` commands as specified.

#### **Agent Task 1.2: Execute Infrastructure Script**
*   **My Task:** My next task is to execute the generated script to provision the cloud resources.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # (I will first set the variables within the script myself)
    chmod +x 01-setup-infra.sh
    ./01-setup-infra.sh
    ```
*   **Success Criteria:** I will monitor the terminal output for success messages for each step. The script completes successfully when the final command exits with code 0.
*   **Troubleshooting:** If the script fails, I will examine the error messages and attempt to fix the issue. Common issues include permissions errors or resources already existing.

---

### **Epic 2: Application Source Code Generation**
**Goal:** Generate the complete, correct, and deployable source code for the serverless RAG application.

#### **Agent Task 2.1: Initialize Project & Dependencies**
*   **My Task:** Initialize the local project structure, create a `.gitignore` file, and install all necessary dependencies.
*   **[Execution] Commands to run in Terminal:**
    ```bash
    # Create a .gitignore file
    echo "node_modules" > .gitignore

    # Create a package.json file with all dependencies
    echo '{
      "name": "ai-cv-screener",
      "version": "1.0.0",
      "description": "AI-Powered CV Screening Application",
      "main": "lib/index.js",
      "scripts": {
        "build": "tsc",
        "serve": "firebase emulators:start",
        "deploy": "firebase deploy --only functions,hosting"
      },
      "dependencies": {
        "@google-cloud/aiplatform": "^0.11.0",
        "@google-cloud/firestore": "^7.0.0",
        "@google-cloud/storage": "^7.0.0",
        "@langchain/community": "^0.0.28",
        "@langchain/core": "^0.1.30",
        "@langchain/google-genai": "^0.0.10",
        "firebase-admin": "^12.0.0",
        "firebase-functions": "^4.5.0",
        "pdf-parse": "^1.1.1"
      },
      "devDependencies": {
        "@types/node": "^20.10.4",
        "typescript": "^5.3.3"
      }
    }' > package.json

    # Install all dependencies
    npm install
    ```
*   **Success Criteria:** The commands execute successfully, a `node_modules` directory is present, a `package.json` and `package-lock.json` are created, and a `.gitignore` file exists.

#### **Agent Task 2.2: Generate Core Logic and UI Files**
*   **My Task:** Generate all application source files with high-fidelity, verified code.
*   **[Delegation] Prompt for my Code Generation Module:**
    ```prompt
    Generate a complete set of application source code files. Use the following file paths and content as high-fidelity templates. Ensure the code is modern, secure, and idiomatic for Firebase Gen2 Functions and Genkit.

    **File: `tsconfig.json`**
    ```json
    {
      "compilerOptions": {
        "module": "commonjs",
        "noImplicitReturns": true,
        "noUnusedLocals": true,
        "outDir": "lib",
        "sourceMap": true,
        "strict": true,
        "target": "es2017"
      },
      "compileOnSave": true,
      "include": [
        "src"
      ]
    }
    ```

    **File: `src/index.ts`**
    ```typescript
    import { https, storage } from 'firebase-functions/v2';
    import { initializeApp } from 'firebase-admin/app';
    import { getFirestore } from 'firebase-admin/firestore';
    import { getStorage } from 'firebase-admin/storage';
    import { GoogleAIEmbeddings } from '@langchain/google-genai';
    import { FirestoreVectorStore } from '@langchain/community/vectorstores/firestore';
    import { Document } from '@langchain/core/documents';
    import * as pdfparse from 'pdf-parse';
    import { answerCVQuery } from './rag';

    initializeApp();

    export const queryCV = https.onCall(async (request) => {
      const query = request.data.query as string;
      if (!query) throw new https.HttpsError('invalid-argument', 'Query text must be provided.');
      try {
        const answer = await answerCVQuery(query);
        return { answer };
      } catch (error) {
        console.error("Error in queryCV:", error);
        throw new https.HttpsError('internal', 'An error occurred while processing your query.');
      }
    });

    export const ingestCV = storage.object().onFinalize(async (object) => {
      if (!object.name || !object.name.endsWith('.pdf')) return;
      const file = getStorage().bucket(object.bucket).file(object.name);
      try {
        const [fileBuffer] = await file.download();
        const pdfData = await pdfparse(fileBuffer);
        const vectorStore = new FirestoreVectorStore(new GoogleAIEmbeddings(), { firestore: getFirestore() });
        await vectorStore.addDocuments(
          [new Document({ pageContent: pdfData.text, metadata: { source: object.name } })]
        );
        console.log(`Indexed ${object.name}.`);
      } catch (error) {
        console.error(`Error indexing ${object.name}:`, error);
      }
    });
    ```

    **File: `src/rag.ts`**
    ```typescript
    import { generate } from '@genkit-ai/ai/model';
    import { defineRetriever, retrieve } from '@genkit-ai/ai/retriever';
    import { geminiPro } from '@genkit-ai/google-ai';
    import { GoogleAIEmbeddings } from '@langchain/google-genai';
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

    **File: `public/index.html`**
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI CV Screener</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      <div class="container">
        <h1>AI CV Screener</h1>
        <p>Ask a question about the CVs in the library.</p>
        <div class="search-container">
          <input type="text" id="query-input" placeholder="e.g., 'Who has experience in B2B SaaS?'">
          <button id="query-btn">Ask</button>
        </div>
        <div id="loading" class="hidden">Thinking...</div>
        <div id="result-container" class="hidden">
          <h2>Answer:</h2>
          <p id="result-text"></p>
        </div>
      </div>
      <script src="/__/firebase/9.0.0/firebase-app-compat.js"></script>
      <script src="/__/firebase/9.0.0/firebase-functions-compat.js"></script>
      <script src="/__/firebase/init.js"></script>
      <script src="app.js"></script>
    </body>
    </html>
    ```

    **File: `public/styles.css`**
    ```css
    body {
      font-family: sans-serif;
      background-color: #f4f4f9;
      color: #333;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .container {
      width: 80%;
      max-width: 800px;
      background-color: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font-size: 2rem;
      color: #444;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .search-container {
      display: flex;
      margin-bottom: 1.5rem;
    }

    #query-input {
      flex-grow: 1;
      padding: 0.8rem;
      border: 1px solid #ccc;
      border-radius: 4px 0 0 4px;
      font-size: 1rem;
    }

    #query-btn {
      padding: 0.8rem 1.5rem;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-size: 1rem;
    }

    #query-btn:hover {
      background-color: #0056b3;
    }

    .hidden {
      display: none;
    }

    #loading {
      text-align: center;
      padding: 1rem;
      font-size: 1.2rem;
      color: #007bff;
    }

    #result-container {
      background-color: #f9f9f9;
      padding: 1.5rem;
      border-radius: 4px;
      border: 1px solid #eee;
    }

    #result-container h2 {
      margin-top: 0;
      color: #333;
    }

    #result-text {
      font-size: 1.1rem;
      white-space: pre-wrap;
      line-height: 1.6;
    }
    ```

    **File: `public/app.js`**
    ```javascript
    const queryInput = document.getElementById('query-input');
    const queryBtn = document.getElementById('query-btn');
    const loadingDiv = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');

    firebase.initializeApp();
    const functions = firebase.functions();

    queryBtn.addEventListener('click', async () => {
      const query = queryInput.value;
      if (!query) return;

      loadingDiv.classList.remove('hidden');
      resultContainer.classList.add('hidden');

      try {
        const queryCV = functions.httpsCallable('queryCV');
        const result = await queryCV({ query });
        resultText.innerText = result.data.answer;
      } catch (error) {
        console.error("Error calling queryCV function:", error);
        resultText.innerText = 'An error occurred. Please check the console for details.';
      } finally {
        loadingDiv.classList.add('hidden');
        resultContainer.classList.remove('hidden');
      }
    });
    ```
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
    1.  The script must start with `set -e`.
    2.  The script must use the `$PROJECT_ID` environment variable and exit if it's not set.
    3.  **Build:** Include the command `npm run build`.
    4.  **Deployment:** Include the command `firebase deploy --only functions,hosting`.
    5.  **Data Upload:** Include the command `gcloud storage cp ./cv_files/*.pdf gs://$PROJECT_ID-cvs/`.
    ```
*   **Verification:** I will verify the generated script contains all the correct, sequential commands.

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
*   **Troubleshooting:** If the deployment fails, I will check the Firebase logs for more information. If the upload fails, I will ensure the `cv_files` directory exists and contains PDF files.
