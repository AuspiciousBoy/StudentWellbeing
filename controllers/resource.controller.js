const Document = require('../models/document.model');
const ragService = require('../services/rag.service');
const gamificationService = require('../services/gamification.service');

// Upload a document and trigger RAG indexing
const uploadDocument = async (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF file' });
  }

  const originalName = req.file.originalname;
  // Save file relative path
  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    console.log(`[Resource Controller] Processing upload: ${originalName}`);
    
    // Process document text, chunking, and embedding creation
    const doc = await ragService.processDocument(
      title || originalName,
      originalName,
      fileUrl,
      userId,
      req.file.buffer // Process file from memory buffer (Multer MemoryStorage)
    );

    // Award student XP for uploading resources
    if (req.user.role === 'student') {
      await gamificationService.awardXP(userId, 30, `Uploaded study material PDF: ${doc.title}`);
    }

    res.status(201).json({
      message: 'Document uploaded and indexed successfully for RAG Q&A',
      document: {
        _id: doc._id,
        title: doc.title,
        originalName: doc.originalName,
        fileUrl: doc.fileUrl,
        chunksCount: doc.chunks.length,
        createdAt: doc.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to index document: ${error.message}` });
  }
};

// List all documents
const listDocuments = async (req, res) => {
  try {
    const docs = await Document.find()
      .populate('uploadedBy', 'name role')
      .select('-chunks') // Exclude chunks for lighter response
      .sort({ createdAt: -1 });
    
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Ask a question to a specific document (RAG)
const queryDocument = async (req, res) => {
  const { docId } = req.params;
  const { question } = req.body;
  const userId = req.user.id;

  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'Question is required' });
  }

  try {
    console.log(`[RAG Controller] Querying document ${docId} with: "${question}"`);
    
    const result = await ragService.answerDocumentQuestion(docId, question.trim());

    // Award XP for document research
    if (req.user.role === 'student') {
      await gamificationService.awardXP(userId, 10, `Researched document: "${question.substring(0, 30)}..."`);
    }

    res.json({
      answer: result.answer,
      citations: result.citations
    });
  } catch (error) {
    res.status(500).json({ message: `Error performing RAG query: ${error.message}` });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  const { docId } = req.params;
  try {
    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Verify ownership or admin/faculty privilege
    if (doc.uploadedBy.toString() !== req.user.id && req.user.role === 'student') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await Document.findByIdAndDelete(docId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  queryDocument,
  deleteDocument
};
