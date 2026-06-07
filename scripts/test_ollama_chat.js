const ollama = require('../services/ollama.service');

(async () => {
  try {
    const prompt = 'Explain the Pomodoro technique and give a 2-week study plan for exams.';
    const systemPrompt = `You are a helpful, empathetic AI Learning Assistant focused on concise, actionable study advice.`;

    console.log('[Test] Sending prompt to generateCompletion...');
    const res = await ollama.generateCompletion(prompt, systemPrompt);
    console.log('[Test] Response:');
    console.log(res);
  } catch (err) {
    console.error('[Test] Error calling generateCompletion:', err);
  }
})();
