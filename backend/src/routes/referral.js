const express = require('express');
const Referral = require('../models/Referral');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all referrals
router.get('/', auth, async (req, res) => {
  try {
    const { company, type, experienceLevel, page = 1, limit = 20, search } = req.query;
    const query = { isActive: true };

    if (company) query.company = { $regex: company, $options: 'i' };
    if (type) query.type = type;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const referrals = await Referral.find(query)
      .populate('postedBy', 'name currentCompany currentRole avatar')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Referral.countDocuments(query);

    res.json({ referrals, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create referral
router.post('/', auth, async (req, res) => {
  try {
    const { company, role, description, requirements, location, type, experienceLevel, salary, applicationLink, tags, deadline } = req.body;

    if (!company || !role || !description) {
      return res.status(400).json({ message: 'Company, role, and description are required' });
    }

    const referral = new Referral({
      postedBy: req.user.id,
      company, role, description, requirements, location, type, experienceLevel, salary, applicationLink, tags, deadline
    });

    await referral.save();
    res.status(201).json({ message: 'Referral posted', referral });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for referral
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: 'Referral not found' });

    const alreadyApplied = referral.applicants.find(a => a.user.toString() === req.user.id);
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

    referral.applicants.push({ user: req.user.id, note: req.body.note || '' });
    await referral.save();

    res.json({ message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get referral by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('postedBy', 'name currentCompany currentRole avatar')
      .populate('applicants.user', 'name email college');
    if (!referral) return res.status(404).json({ message: 'Referral not found' });
    res.json(referral);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my posted referrals
router.get('/my/posted', auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ postedBy: req.user.id })
      .populate('applicants.user', 'name email college')
      .sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
