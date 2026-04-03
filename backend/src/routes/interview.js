const express = require('express');
const { auth } = require('../middleware/auth');
const { generateQuestion, evaluateAnswer } = require('../services/mockInterview');

const router = express.Router();

// Generate interview question
router.post('/question', auth, async (req, res) => {
  try {
    const { role, difficulty, category, previousQuestions } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Target role is required' });
    }

    const question = await generateQuestion(role, difficulty || 'medium', category || 'mixed', previousQuestions || []);
    res.json(question);
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ message: 'Error generating question' });
  }
});

// Evaluate answer
router.post('/evaluate', auth, async (req, res) => {
  try {
    const { question, answer, role } = req.body;

    if (!question || !answer || !role) {
      return res.status(400).json({ message: 'Question, answer, and role are required' });
    }

    const feedback = await evaluateAnswer(question, answer, role);
    res.json(feedback);
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ message: 'Error evaluating answer' });
  }
});

module.exports = router;
