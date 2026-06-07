import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, 
  Send, 
  Trash2, 
  FileText, 
  UploadCloud, 
  MessageSquare, 
  ArrowRight, 
  HelpCircle,
  FileCode,
  CheckCircle2
} from 'lucide-react';

export default function StudyCenter() {
  const { apiFetch, user } = useAuth();
  
  // AI Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // RAG States
  const [documents, setDocuments] = useState([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragAnswer, setRagAnswer] = useState(null);
  const [ragLoading, setRagLoading] = useState(false);

  // Load chat and documents
  const loadData = async () => {
    try {
      // 1. Fetch AI Chat History
      const chatRes = await apiFetch('/api/ai/chat');
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatMessages(chatData.messages || []);
      }

      // 2. Fetch Document List
      const docRes = await apiFetch('/api/resources/list');
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocuments(docData);
      }
    } catch (err) {
      console.error('Failed to load study center data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Send AI Chat Message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const messageText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    // Optimistically update UI
    setChatMessages(prev => [...prev, { sender: 'student', text: messageText, timestamp: new Date() }]);

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ text: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.chat.messages);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Clear Chat History
  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      try {
        const res = await apiFetch('/api/ai/chat', { method: 'DELETE' });
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data.chat.messages);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Handle PDF Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || uploading) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle || uploadFile.name);
    formData.append('file', uploadFile);

    try {
      // Custom apiFetch headers override since we're uploading FormData
      const token = localStorage.getItem('sw_token');
      const res = await fetch('/api/resources/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadTitle('');
        setUploadFile(null);
        // Reset file input element
        document.getElementById('file-input').value = '';
        
        // Reload docs list
        loadData();
        alert('Document uploaded and parsed for RAG successfully!');
      } else {
        const errData = await res.json();
        alert(`Upload failed: ${errData.message}`);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  // Ask RAG Question
  const handleAskRag = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !ragQuestion.trim() || ragLoading) return;

    setRagLoading(true);
    setRagAnswer(null);

    try {
      const res = await apiFetch(`/api/resources/query/${selectedDoc._id}`, {
        method: 'POST',
        body: JSON.stringify({ question: ragQuestion.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setRagAnswer(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRagLoading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id) => {
    if (window.confirm('Delete this document? This removes the semantic RAG index.')) {
      try {
        const res = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' });
        if (res.ok) {
          if (selectedDoc?._id === id) {
            setSelectedDoc(null);
            setRagAnswer(null);
          }
          loadData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[calc(100vh-80px)]">
      
      {/* LEFT MODULE - Conversational AI Assistant */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 flex flex-col h-[76vh] min-h-[500px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-200">AI Learning Assistant</h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                Local Ollama AI Chat
              </p>
            </div>
          </div>
          <button 
            onClick={handleClearChat}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {chatMessages.length === 0 ? (
            <div className="my-auto text-center max-w-sm mx-auto flex flex-col items-center">
              <span className="text-4xl">📚</span>
              <h4 className="font-bold text-slate-200 mt-4 text-sm">Your Academic Companion</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Ask me to explain concepts, prepare practice quiz questions, draft summaries, or suggest career resources!
              </p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => {
              const isAI = msg.sender === 'ai';
              return (
                <div 
                  key={idx} 
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isAI 
                      ? 'bg-slate-900/50 border border-slate-850 text-slate-200 rounded-tl-none' 
                      : 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/10'
                  }`}>
                    <span className="font-black text-[9px] block uppercase tracking-wider mb-1 opacity-70">
                      {isAI ? 'AI Assistant' : 'You'}
                    </span>
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                </div>
              );
            })
          )}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/50 border border-slate-850 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <form onSubmit={handleSendChat} className="p-4 border-t border-slate-850 bg-slate-900/20">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask a question or explain a topic..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-600"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="absolute right-2 p-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT MODULE - PDF RAG Document Hub */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 flex flex-col h-[76vh] min-h-[500px]">
        {/* Document Hub Header */}
        <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wellbeing-500/10 text-wellbeing-400 border border-wellbeing-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-200">Study Materials & RAG Hub</h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                Semantic QA over PDF Documents
              </p>
            </div>
          </div>
        </div>

        {/* Split interior panel scroll */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* Upload PDF Section */}
          <div className="p-5 border border-slate-850 rounded-2xl bg-slate-900/20">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Upload Notes / PDF
            </h4>
            <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="Document Title (optional)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-600 mb-2"
                />
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-wellbeing-500/10 file:text-wellbeing-400 file:cursor-pointer hover:file:bg-wellbeing-500/20 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full md:w-auto bg-gradient-to-r from-wellbeing-600 to-wellbeing-500 hover:from-wellbeing-500 hover:to-wellbeing-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                {uploading ? 'Parsing...' : 'Upload & Index'}
              </button>
            </form>
          </div>

          {/* List of documents */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Available Documents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-600 col-span-2 text-center py-4">No documents indexed yet.</p>
              ) : (
                documents.map(doc => (
                  <div 
                    key={doc._id}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      selectedDoc?._id === doc._id
                        ? 'bg-wellbeing-500/10 border-wellbeing-500'
                        : 'bg-slate-900/40 border-slate-850 hover:border-slate-700'
                    }`}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setRagAnswer(null);
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <FileCode className={`w-4.5 h-4.5 shrink-0 ${selectedDoc?._id === doc._id ? 'text-wellbeing-400' : 'text-slate-500'}`} />
                      <div className="overflow-hidden">
                        <h5 className="text-[11px] font-bold text-slate-200 truncate">{doc.title}</h5>
                        <span className="text-[9px] text-slate-500 block truncate">Pages: {doc.chunksCount ? Math.round(doc.chunksCount/2) || 1 : 'N/A'}</span>
                      </div>
                    </div>
                    {(user.role === 'admin' || user.role === 'faculty' || doc.uploadedBy === user.id) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc._id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Document Q&A Section */}
          {selectedDoc ? (
            <div className="border border-slate-850 rounded-2xl bg-slate-900/20 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-wellbeing-400" />
                <h4 className="text-xs font-bold text-slate-200">
                  Active Q&A: <span className="text-wellbeing-400">{selectedDoc.title}</span>
                </h4>
              </div>

              {/* RAG query Form */}
              <form onSubmit={handleAskRag} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question from this document..."
                  value={ragQuestion}
                  onChange={(e) => setRagQuestion(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 placeholder-slate-650"
                />
                <button
                  type="submit"
                  disabled={ragLoading || !ragQuestion.trim()}
                  className="bg-brand-500 hover:bg-brand-400 text-white rounded-xl px-4 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  Ask
                </button>
              </form>

              {/* RAG Answer Display */}
              {ragLoading && (
                <div className="flex flex-col gap-1.5 items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-wellbeing-500"></div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Retrieving facts...</span>
                </div>
              )}

              {ragAnswer && (
                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 text-xs leading-relaxed animate-fade-in">
                  <div className="font-bold text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                    <Bot className="w-4 h-4 text-brand-400" />
                    AI Answer (RAG Semantic Context)
                  </div>
                  <p className="text-slate-200 mt-2 whitespace-pre-line">{ragAnswer.answer}</p>
                  
                  {ragAnswer.citations && ragAnswer.citations.length > 0 && (
                    <div className="mt-4 pt-2 border-t border-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Citations:</span>
                      {ragAnswer.citations.map((page, i) => (
                        <span 
                          key={i} 
                          className="bg-wellbeing-500/10 text-wellbeing-400 text-[9px] font-black px-2 py-0.5 rounded border border-wellbeing-500/20"
                        >
                          Page {page}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-850 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Select a document from the list to start Q&A.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
