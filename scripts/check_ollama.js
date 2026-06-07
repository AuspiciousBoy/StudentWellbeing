const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

const endpoints = ['/', '/api/ping', '/api/models', '/api/chat'];

(async () => {
  console.log(`[Check Ollama] Using OLLAMA_URL=${OLLAMA_URL}`);
  for (const ep of endpoints) {
    const url = `${OLLAMA_URL.replace(/\/$/, '')}${ep}`;
    try {
      const res = await fetch(url, { method: 'GET' });
      console.log(`GET ${ep} -> ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(text.slice(0, 200).replace(/\n/g, ' '));
    } catch (err) {
      console.log(`GET ${ep} -> Error: ${err.message}`);
    }
  }
})();
