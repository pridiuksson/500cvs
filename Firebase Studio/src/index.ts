import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase/plugin';
import { defineFirestoreRetriever } from '@genkit-ai/firebase/retriever';
import { z } from 'zod';
import * as fs from 'fs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { getStorage } from 'firebase-admin/storage';
import * as pdfParse from 'pdf-parse';

initializeApp();

const genkitApp = genkit({
  plugins: [
    googleAI(),
    firebase(),
  ],
});

export const cvRetriever = defineFirestoreRetriever({
  collection: 'cvs',
  contentField: 'text',
  vectorField: 'embedding',
  embedder: googleAI.embedder('text-embedding-gecko-001'),
});

export const ingestCVFlow = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  const bucket = getStorage().bucket(event.data.bucket);
  const file = bucket.file(filePath);
  const [buffer] = await file.download();

  const pdfData = await pdfParse.default(buffer);

  const chunks = pdfData.text.split('\n\n');

  const firestoreDB = getFirestore();
  const collection = firestoreDB.collection('cvs');

  for (const chunk of chunks) {
    if (chunk.trim().length === 0) continue;

    const embedding = await genkitApp.embed({
      embedder: googleAI.embedder('text-embedding-gecko-001'),
      content: chunk,
    });

    await collection.add({
      text: chunk,
      embedding: embedding.embedding,
    });
  }
});

export const queryCV = genkitApp.defineFlow(
  {
    name: 'queryCV',
    inputSchema: z.string(),
    outputSchema: z.string(),
    https: true,
  },
  async (query: string) => {
    const docs = await cvRetriever.retrieve(query);

    const ragPrompt = {
      history: [],
      messages: [
        {
          role: 'user',
          content: [
            {
              text: `You are a helpful CV screening assistant. Answer the user's question based only on the context provided below.\n\nCONTEXT:\n${docs.map((d: any) => d.content[0].text).join('\n---\n')}\n\nQUESTION:\n${query}`,
            },
          ],
        },
      ],
    };

    const response = await genkitApp.generate({
      model: googleAI.model('gemini-pro'),
      prompt: ragPrompt,
      config: { temperature: 0.3 },
    });

    return response.text;
  }
);
