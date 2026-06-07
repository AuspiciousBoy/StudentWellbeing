const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL || 'llama3';
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

// Advanced intelligent response generator that simulates ChatGPT/Claude-like reasoning
const generateIntelligentResponse = (userMessage, chatHistory = []) => {
  const msg = userMessage.toLowerCase().trim();
  
  // Extract key topics from the message
  const hasMultipleTopics = (text) => {
    const topics = text.split(/[,;.?!]/);
    return topics.length > 1;
  };

  // Generate reasoning-based response (ChatGPT/Claude style)
  const generateThinkingResponse = (question, context = '') => {
    // This function creates responses that show reasoning
    const responses = {
      stress_anxiety: {
        thinking: "The user is experiencing stress and anxiety related to academics. I should provide both immediate coping strategies and long-term approaches. I should also validate their feelings.",
        response: `I understand you're feeling stressed and anxious—that's something many students experience. Let me break this down into actionable strategies:\n\n**Immediate Relief (Today):**\n• Box Breathing: Breathe in for 4 counts, hold for 4, exhale for 4. Repeat 5 times.\n• 5-minute walk outside—movement reduces cortisol\n• Cut out one non-essential task today\n\n**This Week:**\n• Use Pomodoro Technique: 25 min focused work + 5 min break\n• Journal 3 things you accomplished daily (builds momentum)\n• Exercise 20 minutes—proven stress reducer\n\n**Long-term Foundation:**\n• Sleep 7-8 hours (non-negotiable for stress resilience)\n• Eat regular meals + stay hydrated\n• Weekly counselor check-in\n\nWhat's the biggest source of stress right now? We can tackle that first.`
      },
      
      programming_learning: {
        thinking: "The user wants to learn programming. I should provide a structured learning path, explain why each step matters, and give concrete resources.",
        response: `Great question! Learning programming effectively requires understanding the journey. Here's a structured path:\n\n**Phase 1: Foundations (2-3 weeks)**\nFocus: Variables, data types, loops, conditionals, functions\nWhy: These are building blocks for everything else\nResources: Codecademy, freeCodeCamp's JavaScript basics\nGoal: Write functions that solve simple problems\n\n**Phase 2: Problem Solving (2-3 weeks)**\nFocus: Break problems into steps, practice algorithms\nWhy: This is how real programmers think\nResources: LeetCode Easy problems, HackerRank\nGoal: Solve 20-30 problems comfortably\n\n**Phase 3: Building Projects (4+ weeks)**\nFocus: Create something real—a to-do app, calculator, etc.\nWhy: Employers want to see what you can build\nResources: Build small projects, push to GitHub\nGoal: 3-4 portfolio projects\n\n**Most Important:** Code every single day, even 30 minutes. Consistency beats marathon coding sessions.\n\nWhich language interests you most? I can give more specific guidance.`
      },

      study_exam_prep: {
        thinking: "The user is preparing for exams. I should explain WHY certain study methods work and provide a personalized plan.",
        response: `Exam prep is about strategy, not just time spent. Let me share what actually works:\n\n**The Science Behind Effective Studying:**\n• Active Recall (testing yourself) > Passive reading (2-3x more effective)\n• Spaced Repetition (review after 1 day, 3 days, 1 week, 2 weeks)\n• Interleaving (mix topics instead of studying one at a time)\n\n**Your Exam Prep Plan (from now until exam):**\n\n*Week 1-2: Learn & Summarize*\n- Read/watch content\n- Write summaries WITHOUT looking at notes\n- This forces your brain to process deeply\n\n*Week 3: Practice & Review*\n- Create flashcards for hard concepts\n- Practice 5-10 past exam questions daily\n- Notice patterns in question types\n\n*Week 4: Test Yourself*\n- Take full mock exams under timed conditions\n- Review mistakes immediately\n- Focus on WHY you got it wrong, not just the right answer\n\n*2 Days Before: Rest & Light Review*\n- No new material\n- Sleep well\n- Confidence building\n\n**During Exam:**\n- Read questions carefully\n- Answer easy ones first\n- Show your work (partial credit)\n\nHow much time until your exam? I can adjust this timeline.`
      },

      database_backend: {
        thinking: "The user has questions about databases or backend development. I should explain concepts clearly with practical examples.",
        response: `Let me explain database and backend concepts in a way that clicks:\n\n**Why Databases Matter:**\nA database is like a well-organized filing system. Without it, servers would lose all data when they restart.\n\n**SQL vs NoSQL (Simple Version):**\n\n*SQL (like PostgreSQL):*\n- Structured like a spreadsheet (tables, rows, columns)\n- Best for: Complex relationships (students → courses → grades)\n- Reliability: Very strict about data correctness\n\n*NoSQL (like MongoDB):*\n- Flexible structure (documents like JSON)\n- Best for: Quick prototyping, varying data types\n- Speed: Often faster for simple reads\n\n**Common Backend Pattern:**\n1. User sends request → Server receives it\n2. Server queries database\n3. Server processes data\n4. Server sends response to user\n\n**Practical Example: A Student Profile System**\n\n*API Request:* GET /student/123\n↓\n*Backend Logic:* \n  - Verify user has permission\n  - Query: SELECT * FROM students WHERE id = 123\n  - Format response\n↓\n*Response:* { name: 'John', email: '...', semester: 3 }\n\n**Learning Path:**\n1. Understand HTTP requests/responses\n2. Learn SQL basics (SELECT, INSERT, UPDATE, DELETE)\n3. Connect it all together with Node.js/Express\n4. Practice with real projects\n\nWhat specific backend challenge are you facing?`
      },

      career_job: {
        thinking: "The user is thinking about career/jobs. I should provide realistic, actionable career advice based on current market.",
        response: `Let's discuss your career strategy. Here's what actually matters in today's job market:\n\n**The 3 Pillars Employers Care About:**\n\n1. **Portfolio & Real Projects** (Most Important - 50%)\n   - GitHub with 3-4 solid projects\n   - Projects should solve real problems\n   - Clean code, good README documentation\n   - Deploy projects live (Vercel, Heroku, etc.)\n\n2. **Technical Skills** (30%)\n   - Strong fundamentals (data structures, algorithms)\n   - Know 1-2 languages deeply\n   - Understand how your tools work\n\n3. **Communication & Soft Skills** (20%)\n   - Explain complex ideas simply\n   - Work well in teams\n   - Ask good questions\n\n**Job Search Timeline:**\n\n*Now - 2 months: Build*\n- Complete 2-3 strong portfolio projects\n- Add them to GitHub with good documentation\n- Deploy them live\n- Write about what you learned (blog posts)\n\n*2-4 months: Apply & Interview*\n- Research companies you admire\n- Tailor applications (not mass apply)\n- Practice coding interviews (LeetCode medium level)\n- Do mock interviews with friends\n\n*4+ months: Negotiate*\n- If multiple offers, negotiate salary\n- Consider growth opportunity vs. money\n\n**Real Talk:** Internships are gold. They often convert to full-time roles. Apply for them even if you feel \"not ready.\"\n\nWhat role are you targeting? I can give specific advice.`
      },

      general_help: {
        thinking: "The user asked a general question that doesn't fit specific categories. I should provide thoughtful, helpful guidance.",
        response: `That's a great question! Let me think through this with you.\n\nWhen I consider your question, several important aspects come to mind:\n\n**First, let's clarify what you're really asking:**\n- What's the core problem you're trying to solve?\n- Have you already tried anything, and what happened?\n- What would success look like for you?\n\n**Thinking Process:**\n1. Break the big problem into smaller parts\n2. Address the easiest part first (builds momentum)\n3. Learn from each attempt\n4. Adjust based on what you learn\n\n**My Recommendation:**\nStart with the fundamentals, then iterate. Most learning happens through doing, not just thinking about doing.\n\n**Next Steps:**\n- Can you tell me more specifically what you're working on?\n- What's your current biggest challenge with it?\n- What have you already tried?\n\nWith those details, I can give you much more targeted advice that actually solves your problem!\n\nWhat would be most helpful to focus on?`
      }
    };

    // Detect topic and return appropriate response
    if (msg.includes('stress') || msg.includes('anxiety') || msg.includes('overwhelm') || msg.includes('anxious')) {
      return responses.stress_anxiety.response;
    }
    if (msg.includes('learn') && (msg.includes('javascript') || msg.includes('react') || msg.includes('code') || msg.includes('programming'))) {
      return responses.programming_learning.response;
    }
    if (msg.includes('exam') || msg.includes('test') || msg.includes('prepare') || msg.includes('study')) {
      return responses.study_exam_prep.response;
    }
    if (msg.includes('database') || msg.includes('backend') || msg.includes('mongodb') || msg.includes('api')) {
      return responses.database_backend.response;
    }
    if (msg.includes('career') || msg.includes('job') || msg.includes('internship') || msg.includes('interview')) {
      return responses.career_job.response;
    }
    
    return responses.general_help.response;
  };

  return generateThinkingResponse(msg);
};

const generateCompletion = async (prompt, systemPrompt = '') => {
  // Build chat-style messages so the model drives the response
  const messages = [];
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 20000); // 20s timeout for chat

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Ollama HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ollama chat responses may surface under different keys depending on version.
    // Try common shapes: data.choices[0].message.content or data.response or data.message
    if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    }

    if (data && data.response) return data.response;
    if (data && data.message && data.message.content) return data.message.content;

    // Fallback to returning the raw JSON as string if shape is unexpected
    return JSON.stringify(data);
  } catch (error) {
    console.log(`[Ollama Service] Ollama chat unavailable. Error: ${error.message}`);
    // If Ollama is unavailable, return a short informative message rather than running local rule-based logic.
    return 'Sorry — the AI assistant is currently unavailable. Please try again in a moment.';
  }
};

const generateEmbeddings = async (text) => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: text
      }),
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Ollama HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    // Generate a pseudo-random embedding vector of 384 dimensions if offline
    // (a simple deterministic vector based on the string length and characters)
    const dim = 384;
    const embedding = [];
    const strLen = text.length || 1;
    
    for (let i = 0; i < dim; i++) {
      const code = text.charCodeAt(i % strLen) || 1;
      // create numbers between -1 and 1
      embedding.push(Math.sin(code + i) * Math.cos(strLen / (i + 1)));
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
    const normalized = embedding.map(val => val / magnitude);

    return normalized;
  }
};

module.exports = {
  generateCompletion,
  generateEmbeddings
};
