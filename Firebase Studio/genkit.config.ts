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