const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// In-memory store for demo mode (when MongoDB is unavailable)
const inMemoryUsers = new Map();

const isDBConnected = () => mongoose.connection.readyState === 1;

// Helper: get User model safely
const getUserModel = () => {
  if (!isDBConnected()) return null;
  return require('../models/User');
};

const makeToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'pathnexis_secret', { expiresIn: '7d' });

// ── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, college, graduationYear, degree } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // ── MongoDB path ────────────────────────────────
    if (isDBConnected()) {
      const User = getUserModel();
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'User already exists' });

      const user = new User({ name, email, password, role: role || 'student', college, graduationYear, degree });
      await user.save();

      const token = makeToken({ id: user._id, email: user.email, role: user.role });
      return res.status(201).json({ message: 'Registration successful', token, user: user.toPublicJSON() });
    }

    // ── In-memory fallback ──────────────────────────
    if (inMemoryUsers.has(email))
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;
    const user = {
      _id: userId, id: userId,
      name, email, password: hashedPassword,
      role: role || 'student',
      college: college || '',
      graduationYear: graduationYear || null,
      degree: degree || '',
      skills: [], bio: '', avatar: '',
      currentCompany: '', currentRole: '',
      linkedinUrl: '', githubUrl: '',
      location: '', connections: [],
      isAvailableForMentorship: false,
      mentorshipTopics: [],
      createdAt: new Date().toISOString(),
    };
    inMemoryUsers.set(email, user);

    const { password: _pw, ...publicUser } = user;
    const token = makeToken({ id: userId, email, role: user.role });
    return res.status(201).json({ message: 'Registration successful (demo mode)', token, user: publicUser });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    // ── MongoDB path ────────────────────────────────
    if (isDBConnected()) {
      const User = getUserModel();
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = makeToken({ id: user._id, email: user.email, role: user.role });
      return res.json({ message: 'Login successful', token, user: user.toPublicJSON() });
    }

    // ── In-memory fallback ──────────────────────────
    const user = inMemoryUsers.get(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const { password: _pw, ...publicUser } = user;
    const token = makeToken({ id: user._id, email, role: user.role });
    return res.json({ message: 'Login successful', token, user: publicUser });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ── GET ME ───────────────────────────────────────────────────────────────────
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    if (isDBConnected()) {
      const User = getUserModel();
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }

    // In-memory fallback: find by id
    for (const [, u] of inMemoryUsers) {
      if (u._id === req.user.id) {
        const { password: _pw, ...publicUser } = u;
        return res.json(publicUser);
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put('/profile', require('../middleware/auth').auth, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'phone', 'college', 'graduationYear', 'degree',
      'skills', 'currentCompany', 'currentRole', 'linkedinUrl', 'githubUrl',
      'location', 'isAvailableForMentorship', 'mentorshipTopics', 'avatar'];

    if (isDBConnected()) {
      const User = getUserModel();
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }
      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
      return res.json({ message: 'Profile updated', user });
    }

    // In-memory fallback
    for (const [email, u] of inMemoryUsers) {
      if (u._id === req.user.id) {
        for (const key of allowed) {
          if (req.body[key] !== undefined) u[key] = req.body[key];
        }
        inMemoryUsers.set(email, u);
        const { password: _pw, ...publicUser } = u;
        return res.json({ message: 'Profile updated', user: publicUser });
      }
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
