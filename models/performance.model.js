const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    marks: {
      type: Number,
      required: true
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    examName: {
      type: String,
      required: true
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

module.exports = mongoose.model('Performance', performanceSchema);
