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
