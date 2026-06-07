const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mood: {
      type: String,
      enum: ['happy', 'neutral', 'stressed', 'anxious', 'sad'],
      required: true
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    engagementLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Mood', moodSchema);
