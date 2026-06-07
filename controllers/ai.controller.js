const Chat = require('../models/chat.model');
const ollamaService = require('../services/ollama.service');
const gamificationService = require('../services/gamification.service');

// Get chat history for student
const getChatHistory = async (req, res) => {
  const studentId = req.user.id;
  try {
    let chat = await Chat.findOne({ studentId });
    if (!chat) {
      chat = await Chat.create({ studentId, messages: [] });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Send a message to AI assistant
const sendChatMessage = async (req, res) => {
  const studentId = req.user.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  try {
    let chat = await Chat.findOne({ studentId });
    if (!chat) {
      chat = await Chat.create({ studentId, messages: [] });
    }

    // 1. Add student message to history
    chat.messages.push({
      sender: 'student',
      text: text.trim()
    });

    // 2. Format last few messages for chat context
    const contextMessages = chat.messages.slice(-6); // grab last 6 messages
    const formattedHistory = contextMessages
      .map(m => `${m.sender === 'student' ? 'Student' : 'AI'}: ${m.text}`)
      .join('\n');

    const prompt = `${formattedHistory}\nAI:`;
    const systemPrompt = `You are a helpful, empathetic AI Learning Assistant and Student Wellbeing Tutor. 
Your goal is to explain academic concepts clearly, help with exam prep, give career tips, and support student wellbeing. 
Keep your explanations concise, encouraging, and structured.`;

    console.log('[AI Assistant] Fetching response from local AI...');
    const aiResponse = await ollamaService.generateCompletion(prompt, systemPrompt);

    // 3. Add AI response to history
    chat.messages.push({
      sender: 'ai',
      text: aiResponse
    });

    await chat.save();

    // 4. Award XP for study interaction
    await gamificationService.awardXP(studentId, 5, 'Asked AI Learning Assistant a concept question');

    res.json({
      response: aiResponse,
      chat
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Clear chat history
const clearChatHistory = async (req, res) => {
  const studentId = req.user.id;
  try {
    const chat = await Chat.findOne({ studentId });
    if (chat) {
      chat.messages = [];
      await chat.save();
    }
    res.json({ message: 'Chat history cleared successfully', chat });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  getChatHistory,
  sendChatMessage,
  clearChatHistory
};
