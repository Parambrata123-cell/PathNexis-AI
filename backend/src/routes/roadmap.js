const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const { generateRoadmap } = require('../services/roadmapGenerator');

const router = express.Router();
const inMemoryRoadmaps = new Map(); // userId -> [roadmaps]

const isDBConnected = () => mongoose.connection.readyState === 1;

// ── GENERATE ─────────────────────────────────────────────────────────────────
router.post('/generate', auth, async (req, res) => {
  try {
    const { careerGoal, currentSkills, currentLevel } = req.body;
    if (!careerGoal) return res.status(400).json({ message: 'Career goal is required' });

    const roadmap = await generateRoadmap(careerGoal, currentSkills || [], currentLevel || 'beginner');

    let totalTopics = 0;
    if (roadmap.phases) roadmap.phases.forEach(p => { if (p.topics) totalTopics += p.topics.length; });

    const progressDoc = {
      _id: `roadmap_${Date.now()}`,
      user: req.user.id,
      careerGoal,
      currentLevel: currentLevel || 'beginner',
      roadmap,
      totalTopics,
      completedTopics: 0,
      progressPercentage: 0,
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (isDBConnected()) {
      const LearningProgress = require('../models/LearningProgress');
      const progress = new LearningProgress({
        user: req.user.id, careerGoal,
        currentLevel: progressDoc.currentLevel,
        roadmap, totalTopics,
        completedTopics: 0, progressPercentage: 0,
      });
      await progress.save();
      progressDoc._id = progress._id.toString();
      return res.status(201).json({ message: 'Roadmap generated', progress });
    }

    // In-memory fallback
    const userRoadmaps = inMemoryRoadmaps.get(req.user.id) || [];
    userRoadmaps.unshift(progressDoc);
    inMemoryRoadmaps.set(req.user.id, userRoadmaps);
    res.status(201).json({ message: 'Roadmap generated', progress: progressDoc });
  } catch (error) {
    console.error('Roadmap error:', error);
    res.status(500).json({ message: 'Error generating roadmap' });
  }
});

// ── GET ALL ───────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    if (isDBConnected()) {
      const LearningProgress = require('../models/LearningProgress');
      const roadmaps = await LearningProgress.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json(roadmaps);
    }
    res.json(inMemoryRoadmaps.get(req.user.id) || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET ONE ───────────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    if (isDBConnected()) {
      const LearningProgress = require('../models/LearningProgress');
      const roadmap = await LearningProgress.findOne({ _id: req.params.id, user: req.user.id });
      if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
      return res.json(roadmap);
    }
    const userRoadmaps = inMemoryRoadmaps.get(req.user.id) || [];
    const roadmap = userRoadmaps.find(r => r._id === req.params.id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── TOGGLE TOPIC ──────────────────────────────────────────────────────────────
router.put('/:id/topic/:phaseIndex/:topicIndex/complete', auth, async (req, res) => {
  try {
    const phaseIdx = parseInt(req.params.phaseIndex);
    const topicIdx = parseInt(req.params.topicIndex);

    if (isDBConnected()) {
      const LearningProgress = require('../models/LearningProgress');
      const progress = await LearningProgress.findOne({ _id: req.params.id, user: req.user.id });
      if (!progress) return res.status(404).json({ message: 'Roadmap not found' });

      const topic = progress.roadmap.phases[phaseIdx]?.topics[topicIdx];
      if (topic) {
        const was = topic.isCompleted;
        topic.isCompleted = !was;
        topic.completedAt = topic.isCompleted ? new Date() : null;
        progress.completedTopics = Math.max(0, progress.completedTopics + (topic.isCompleted ? 1 : -1));
        progress.progressPercentage = progress.totalTopics > 0
          ? Math.round((progress.completedTopics / progress.totalTopics) * 100) : 0;
        progress.markModified('roadmap');
        await progress.save();
      }
      return res.json({ message: 'Progress updated', progress });
    }

    // In-memory fallback
    const userRoadmaps = inMemoryRoadmaps.get(req.user.id) || [];
    const progress = userRoadmaps.find(r => r._id === req.params.id);
    if (!progress) return res.status(404).json({ message: 'Roadmap not found' });

    const topic = progress.roadmap.phases?.[phaseIdx]?.topics?.[topicIdx];
    if (topic) {
      const was = topic.isCompleted;
      topic.isCompleted = !was;
      topic.completedAt = topic.isCompleted ? new Date().toISOString() : null;
      progress.completedTopics = Math.max(0, (progress.completedTopics || 0) + (topic.isCompleted ? 1 : -1));
      progress.progressPercentage = progress.totalTopics > 0
        ? Math.round((progress.completedTopics / progress.totalTopics) * 100) : 0;
    }
    inMemoryRoadmaps.set(req.user.id, userRoadmaps);
    res.json({ message: 'Progress updated', progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
