const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileContent: { type: String, required: true },
  atsScore: { type: Number, default: 0, min: 0, max: 100 },
  analysis: {
    overallFeedback: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    keywordMatch: { type: Number, default: 0 },
    formattingScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 0 },
    skillsScore: { type: Number, default: 0 },
    detectedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    industryFit: { type: String, default: '' },
  },
  targetRole: { type: String, default: '' },
  targetIndustry: { type: String, default: '' },
  analyzedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
