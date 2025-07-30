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
