const pdfParse = require('pdf-parse');
const ollamaService = require('./ollama.service');
const Document = require('../models/document.model');

// Helper to calculate Cosine Similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0.0 || normB === 0.0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Extract text from PDF buffer
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return {
      text: data.text,
      numPages: data.numpages
    };
  } catch (error) {
    console.error('[RAG Service] Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

// Chunk text into overlapping segments
const chunkText = (text, numPages) => {
  // Simple heuristic: split text by double newlines or sentences
  // and distribute them roughly by page if possible, or split into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  
  let currentChunk = '';
  let approxPage = 1;
  const charsPerPage = text.length / (numPages || 1);

  let charCount = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;

    charCount += p.length;
    // Calculate approximate page number
    approxPage = Math.min(numPages, Math.floor(charCount / charsPerPage) + 1);

    if ((currentChunk + p).length > 800) {
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          pageNumber: approxPage
        });
      }
      // Keep overlap
      currentChunk = p;
    } else {
      currentChunk += '\n' + p;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      pageNumber: approxPage
    });
  }

  return chunks;
};

// Process and store document
const processDocument = async (title, originalName, fileUrl, uploadedBy, fileBuffer) => {
  try {
    // 1. Extract text
    const { text, numPages } = await extractTextFromPDF(fileBuffer);
    
    // 2. Chunk text
    const textChunks = chunkText(text, numPages);
    
    // 3. Generate embeddings for each chunk
    const chunksWithEmbeddings = [];
    console.log(`[RAG Service] Generating embeddings for ${textChunks.length} chunks...`);
    
    for (const chunk of textChunks) {
      const embedding = await ollamaService.generateEmbeddings(chunk.text);
      chunksWithEmbeddings.push({
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        embedding
      });
    }

    // 4. Save to DB
    const doc = new Document({
      title,
      originalName,
      fileUrl,
      uploadedBy,
      chunks: chunksWithEmbeddings
    });

    await doc.save();
    return doc;
  } catch (error) {
    console.error('[RAG Service] Error processing document:', error);
    throw error;
  }
};

// Search relevant chunks based on query
const searchRelatedContext = async (documentId, queryText, topK = 3) => {
  try {
    // 1. Get query embedding
    const queryEmbedding = await ollamaService.generateEmbeddings(queryText);

    // 2. Fetch the document
    const doc = await Document.findById(documentId);
    if (!doc) {
      throw new Error('Document not found');
    }

    // 3. Compute cosine similarity for all chunks
    const matches = doc.chunks.map(chunk => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        score: similarity
      };
    });

    // 4. Sort and return top K
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, topK);
  } catch (error) {
    console.error('[RAG Service] Error searching context:', error);
    throw error;
  }
};

// Answer question based on document
const answerDocumentQuestion = async (documentId, question) => {
  try {
    // 1. Get context chunks
    const contextChunks = await searchRelatedContext(documentId, question, 3);
    
    if (contextChunks.length === 0) {
      return {
        answer: 'No relevant context found in this document to answer the question.',
        citations: []
      };
    }

    // 2. Formulate RAG Prompt
    const contextText = contextChunks
      .map((c, idx) => `[Context Chunk ${idx + 1} - Page ${c.pageNumber}]:\n${c.text}`)
      .join('\n\n');

    const systemPrompt = `You are an AI Learning Assistant. Answer the student's question based strictly on the provided document context chunks. 
If the context does not contain enough information to answer the question, say so, but utilize any details that are relevant.
Always refer to the facts inside the context. Do not invent details.`;

    const prompt = `Use the following document text to answer the question.

---
${contextText}
---

Question: ${question}

Provide a comprehensive explanation using the context above.`;

    // 3. Query Ollama
    const answer = await ollamaService.generateCompletion(prompt, systemPrompt);

    // 4. Extract unique citations (page numbers)
    const citations = [...new Set(contextChunks.map(c => c.pageNumber))];

    return {
      answer,
      citations
    };
  } catch (error) {
    console.error('[RAG Service] Error answering question:', error);
    throw error;
  }
};

module.exports = {
  processDocument,
  searchRelatedContext,
  answerDocumentQuestion
};
