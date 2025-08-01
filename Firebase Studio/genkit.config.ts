import { configure } from 'genkit';
import { firebase } from '@genkit-ai/firebase/plugin';
import { googleAI } from '@genkit-ai/googleai';

export default configure({
  plugins: [
    googleAI(),
    firebase(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
