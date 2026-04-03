const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeResume } = require('../services/resumeAnalyzer');

const router = express.Router();
const inMemoryResumes = new Map(); // userId -> [resumes]

const isDBConnected = () => mongoose.connection.readyState === 1;

// ── ANALYZE ──────────────────────────────────────────────────────────────────
router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text;
        } catch (e) {
          resumeText = req.file.buffer.toString('utf-8');
        }
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ message: 'Please upload a resume file or provide resume text' });
    }

    if (resumeText.trim().length < 50)
      return res.status(400).json({ message: 'Resume content is too short for meaningful analysis' });

    const { targetRole, targetIndustry } = req.body;
    const analysis = await analyzeResume(resumeText, targetRole, targetIndustry);

    const resumeDoc = {
      _id: `resume_${Date.now()}`,
      user: req.user.id,
      fileName: req.file ? req.file.originalname : 'text-input',
      atsScore: analysis.atsScore || 0,
      analysis: {
        overallFeedback: analysis.overallFeedback || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        suggestions: analysis.suggestions || [],
        keywordMatch: analysis.keywordMatch || 0,
        formattingScore: analysis.formattingScore || 0,
        experienceScore: analysis.experienceScore || 0,
        educationScore: analysis.educationScore || 0,
        skillsScore: analysis.skillsScore || 0,
        detectedSkills: analysis.detectedSkills || [],
        missingSkills: analysis.missingSkills || [],
        industryFit: analysis.industryFit || '',
      },
      targetRole: targetRole || '',
      targetIndustry: targetIndustry || '',
      analyzedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (isDBConnected()) {
      const Resume = require('../models/Resume');
      const resume = new Resume({
        user: req.user.id,
        fileName: resumeDoc.fileName,
        fileContent: resumeText.substring(0, 5000),
        atsScore: resumeDoc.atsScore,
        analysis: resumeDoc.analysis,
        targetRole: resumeDoc.targetRole,
        targetIndustry: resumeDoc.targetIndustry,
      });
      await resume.save();
      resumeDoc._id = resume._id;
    } else {
      // In-memory fallback
      const userResumes = inMemoryResumes.get(req.user.id) || [];
      userResumes.unshift(resumeDoc);
      inMemoryResumes.set(req.user.id, userResumes);
    }

    res.json({ message: 'Resume analyzed successfully', resume: resumeDoc });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Error analyzing resume: ' + error.message });
  }
});

// ── HISTORY ──────────────────────────────────────────────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    if (isDBConnected()) {
      const Resume = require('../models/Resume');
      const resumes = await Resume.find({ user: req.user.id })
        .sort({ createdAt: -1 }).select('-fileContent').limit(20);
      return res.json(resumes);
    }
    const userResumes = inMemoryResumes.get(req.user.id) || [];
    res.json(userResumes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET ONE ──────────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    if (isDBConnected()) {
      const Resume = require('../models/Resume');
      const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
      if (!resume) return res.status(404).json({ message: 'Resume not found' });
      return res.json(resume);
    }
    const userResumes = inMemoryResumes.get(req.user.id) || [];
    const resume = userResumes.find(r => r._id === req.params.id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
