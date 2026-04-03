const express = require('express');
const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Browse alumni
router.get('/', auth, async (req, res) => {
  try {
    const { company, skill, page = 1, limit = 20, search } = req.query;
    const query = { role: 'alumni' };

    if (company) query.currentCompany = { $regex: company, $options: 'i' };
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { currentRole: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const alumni = await User.find(query)
      .select('-password -email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({ alumni, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alumni profile
router.get('/:id', auth, async (req, res) => {
  try {
    const alumni = await User.findOne({ _id: req.params.id, role: 'alumni' }).select('-password');
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request mentorship
router.post('/mentorship/request', auth, async (req, res) => {
  try {
    const { mentorId, topic, scheduledAt, duration } = req.body;

    const mentor = await User.findOne({ _id: mentorId, role: 'alumni', isAvailableForMentorship: true });
    if (!mentor) return res.status(404).json({ message: 'Mentor not available' });

    const session = new Mentorship({
      mentor: mentorId,
      mentee: req.user.id,
      topic,
      scheduledAt,
      duration: duration || 30
    });

    await session.save();
    res.status(201).json({ message: 'Mentorship request sent', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mentorship sessions
router.get('/mentorship/sessions', auth, async (req, res) => {
  try {
    const sessions = await Mentorship.find({
      $or: [{ mentor: req.user.id }, { mentee: req.user.id }]
    })
      .populate('mentor', 'name currentCompany currentRole avatar')
      .populate('mentee', 'name college avatar')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentorship status
router.put('/mentorship/:id', auth, async (req, res) => {
  try {
    const { status, rating, feedback, meetingLink } = req.body;
    const session = await Mentorship.findById(req.params.id);
    
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.mentor.toString() !== req.user.id && session.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) session.status = status;
    if (rating) session.rating = rating;
    if (feedback) session.feedback = feedback;
    if (meetingLink) session.meetingLink = meetingLink;

    await session.save();
    res.json({ message: 'Session updated', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect with alumni
router.post('/connect/:id', auth, async (req, res) => {
  try {
    const alumniId = req.params.id;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { $addToSet: { connections: alumniId } });
    await User.findByIdAndUpdate(alumniId, { $addToSet: { connections: userId } });

    res.json({ message: 'Connected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
