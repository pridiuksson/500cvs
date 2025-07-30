import { googleAI } from '@genkit-ai/google-ai';
import { firebase } from '@genkit-ai/firebase';
import { configureGenkit } from '@genkit-ai/core';

export default configureGenkit({
  plugins: [googleAI(), firebase()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
