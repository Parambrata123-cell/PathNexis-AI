const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  location: { type: String, default: 'Remote' },
  type: { type: String, enum: ['full-time', 'internship', 'part-time', 'contract'], default: 'full-time' },
  experienceLevel: { type: String, enum: ['entry', 'mid', 'senior'], default: 'entry' },
  salary: { type: String, default: '' },
  applicationLink: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  tags: [{ type: String }],
  deadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
