# **Project Backlog: AI-Powered CV Screening Application**

## **0. Mission Briefing for AI Agent**

**Status:** Activated.
**Mission:** Build and deploy the "AI-Powered CV Screening Application."
**Directives:** This document is my complete operational instruction set. I will execute the Epics sequentially. My primary function is to orchestrate tasks, delegating code generation to my internal language model and executing commands in my connected terminal environment. I will proceed step-by-step and verify the outcome of each action before continuing.

**A Note for the AI Agent:** It is crucial to use the correct package names, versions, and import paths. Please follow these instructions carefully.

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
    Generate a complete set of application source code files. Use the following file paths and content as high-fidelity templates. Ensure the code is modern, secure, and idiomatic for Firebase and Genkit.

    **File: `genkit.config.ts`**
    ```typescript
    import { firebase } from '@genkit-ai/firebase/plugin';
    import { googleAI } from '@genkit-ai/googleai';
    import { configure } from 'genkit';

    export default configure({
      plugins: [
        firebase(),
        googleAI(),
      ],
      logLevel: 'debug',
      enableTracingAndMetrics: true,
    });
    ```

    **File: `tsconfig.json`**
    ```json
    {
      "compilerOptions": {
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "target": "ES2022",
        "outDir": "lib",
        "esModuleInterop": true,
        "strict": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "noUnusedLocals": true,
        "noImplicitReturns": true
      },
      "include": ["src/**/*.ts", "genkit.config.ts"],
      "exclude": ["node_modules"],
      "ts-node": {
        "esm": true
      }
    }
    ```

    **File: `src/index.ts`**
    ```typescript
    import { onObjectFinalized } from 'firebase-functions/v2/storage';
    import { defineFlow, run } from 'genkit/flow';
    import { getStorage } from 'firebase-admin/storage';
    import { initializeApp } from 'firebase-admin/app';
    import * as z from 'zod';
    import pdf from 'pdf-parse';
    import { Document, embed, geminiPro, textEmbedding } from '@genkit-ai/googleai';
    import { onFlow } from '@genkit-ai/firebase/functions';
    import { defineRetriever, retrieve } from 'genkit/ai';
    import { generate } from 'genkit/ai';
    import {
      getFirestore,
    } from 'firebase-admin/firestore';
    import {
      FirestoreVectorStore,
    } from '@genkit-ai/firebase/firestore';

    initializeApp();
    const db = getFirestore();
    const vectorStore = new FirestoreVectorStore({
      firestore: db,
      collection: 'cv-embeddings',
      contentField: 'text',
      embeddingField: 'embedding',
    });

    const cvRetriever = defineRetriever(
      {
        name: 'cv-retriever',
        inputSchema: z.string(),
        outputSchema: z.array(Document.schema)
      },
      async (query: string) => {
        const embedding = await embed({ model: textEmbedding, content: query });
        const docs = await vectorStore.similaritySearch(embedding, 4);
        return { documents: docs };
      }
    );

    export const queryCV = onFlow(
      {
        name: 'queryCV',
        inputSchema: z.string(),
        outputSchema: z.string(),
        authPolicy: (auth, input) => {
          if (!auth) {
            throw new Error('Authentication required.');
          }
        },
      },
      async (query) => {
        const context = await retrieve({ retriever: cvRetriever, query });
        const llmResponse = await generate({
          model: geminiPro,
          prompt: `You are an expert HR assistant. Based ONLY on the following CV excerpts, answer the user's question. If the context does not contain the answer, state that you cannot find the information.\n\n            CONTEXT:\n            ${context.map((doc) => doc.content).join('\n---\n')}\n\n            QUESTION: ${query}`,
        });
        return llmResponse.text();
      }
    );

    const ingestCVFlow = defineFlow(
      {
        name: 'ingestCVFlow',
        inputSchema: z.string(),
        outputSchema: z.void(),
      },
      async (filePath) => {
        const file = getStorage().bucket().file(filePath);
        const [fileBuffer] = await file.download();
        const pdfData = await pdf(fileBuffer);
        const documents = Document.fromText(pdfData.text, { source: filePath });
        await vectorStore.add([documents]);
        console.log(`Indexed ${filePath}.`);
      }
    );

    export const ingestCV = onObjectFinalized(
      { cpu: 2 },
      async (event) => {
        const filePath = event.data.name;
        if (!filePath || !filePath.endsWith('.pdf')) {
          console.log(`Skipping non-PDF file: ${filePath}`);
          return;
        }
        await run(ingestCVFlow, { input: filePath });
      }
    );
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
      <!-- Import the Firebase JS SDK -->
      <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
        import firebaseConfig from "/__/firebase/init.js?useEmulator=true";
        window.firebase = {
          initializeApp,
          getFunctions,
          httpsCallable,
          firebaseConfig
        };
      </script>
      <script type="module" src="app.js"></script>
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
    const { initializeApp, getFunctions, httpsCallable, firebaseConfig } = window.firebase;

    const queryInput = document.getElementById('query-input');
    const queryBtn = document.getElementById('query-btn');
    const loadingDiv = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');

    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app);

    queryBtn.addEventListener('click', async () => {
      const query = queryInput.value;
      if (!query) return;

      loadingDiv.classList.remove('hidden');
      resultContainer.classList.add('hidden');

      try {
        const queryCV = httpsCallable(functions, 'queryCV');
        const result = await queryCV(query);
        resultText.innerText = result.data;
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

```