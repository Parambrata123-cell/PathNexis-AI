const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  scheduledAt: { type: Date },
  duration: { type: Number, default: 30 }, // minutes
  notes: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, default: '' },
  meetingLink: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
