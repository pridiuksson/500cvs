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
    