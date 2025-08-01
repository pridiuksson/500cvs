const queryInput = document.getElementById('query-input');
const queryButton = document.getElementById('query-button');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

const functions = firebase.functions();
const queryCV = functions.httpsCallable('queryCV');

queryButton.addEventListener('click', async () => {
  const query = queryInput.value;
  if (!query) return;

  loading.style.display = 'block';
  results.innerText = '';

  try {
    const result = await queryCV(query);
    results.innerText = result.data;
  } catch (error) {
    console.error(error);
    results.innerText = 'Error: ' + error.message;
  } finally {
    loading.style.display = 'none';
  }
});
