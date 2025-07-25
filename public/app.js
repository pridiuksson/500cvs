const queryInput = document.getElementById('query-input');
const queryBtn = document.getElementById('query-btn');
const loadingDiv = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');

// TODO: Replace with your own Firebase project's configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
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
