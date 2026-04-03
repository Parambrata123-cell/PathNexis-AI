const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  careerGoal: { type: String, required: true },
  currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  roadmap: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    estimatedDuration: { type: String, default: '' },
    phases: [{
      name: { type: String },
      description: { type: String },
      duration: { type: String },
      order: { type: Number },
      topics: [{
        title: { type: String },
        description: { type: String },
        resources: [{ title: String, url: String, type: String }],
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date }
      }]
    }]
  },
  completedTopics: { type: Number, default: 0 },
  totalTopics: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
