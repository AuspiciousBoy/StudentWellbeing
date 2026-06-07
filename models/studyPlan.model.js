const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recommendations: {
      type: [String],
      default: []
    },
    weeklyGoals: [
      {
        task: { type: String, required: true },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
      }
    ],
    generatedByAI: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
