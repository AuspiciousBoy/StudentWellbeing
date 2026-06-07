const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  embedding: {
    type: [Number], // array of floats for vector embedding
    required: true
  }
});

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    chunks: [chunkSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Document', documentSchema);
