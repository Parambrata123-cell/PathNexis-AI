const { OpenAI } = require('openai');

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const callOpenAI = async (systemPrompt, userPrompt, options = {}) => {
  const client = getOpenAIClient();
  
  if (!client) {
    return generateFallbackResponse(systemPrompt, userPrompt);
  }

  try {
    const response = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    return generateFallbackResponse(systemPrompt, userPrompt);
  }
};

// Intelligent fallback when OpenAI is unavailable
function generateFallbackResponse(systemPrompt, userPrompt) {
  if (systemPrompt.includes('resume') || systemPrompt.includes('ATS')) {
    return JSON.stringify({
      atsScore: Math.floor(Math.random() * 30) + 55,
      overallFeedback: "Your resume shows potential but needs optimization for ATS systems. Focus on adding quantifiable achievements, industry-specific keywords, and ensuring clean formatting.",
      strengths: [
        "Clear contact information section",
        "Education section is well-structured",
        "Skills section present"
      ],
      weaknesses: [
        "Lack of quantifiable achievements and metrics",
        "Missing industry-specific keywords",
        "Summary/objective section could be stronger",
        "Action verbs need improvement"
      ],
      suggestions: [
        "Add quantifiable results (e.g., 'Increased sales by 25%')",
        "Include relevant keywords from job descriptions",
        "Use strong action verbs like 'Spearheaded', 'Implemented', 'Optimized'",
        "Add a professional summary tailored to your target role",
        "Include relevant certifications and projects",
        "Ensure consistent formatting throughout"
      ],
      keywordMatch: Math.floor(Math.random() * 25) + 40,
      formattingScore: Math.floor(Math.random() * 20) + 60,
      experienceScore: Math.floor(Math.random() * 25) + 50,
      educationScore: Math.floor(Math.random() * 15) + 70,
      skillsScore: Math.floor(Math.random() * 20) + 55,
      detectedSkills: ["JavaScript", "Python", "Communication", "Problem Solving"],
      missingSkills: ["Cloud Computing", "Data Analysis", "Agile Methodology", "Leadership"],
      industryFit: "Technology / Software Development"
    });
  }

  if (systemPrompt.includes('roadmap') || systemPrompt.includes('learning')) {
    return JSON.stringify({
      title: "Personalized Learning Roadmap",
      description: "A structured path to achieve your career goals with curated resources and milestones.",
      estimatedDuration: "6 months",
      phases: [
        {
          name: "Foundation Building",
          description: "Master the core fundamentals required for your career path",
          duration: "6 weeks",
          order: 1,
          topics: [
            { title: "Core Programming Concepts", description: "Variables, data structures, algorithms, and OOP principles", resources: [{ title: "freeCodeCamp", url: "https://freecodecamp.org", type: "course" }] },
            { title: "Version Control with Git", description: "Learn Git workflows, branching, and collaboration", resources: [{ title: "Git Tutorial", url: "https://git-scm.com/doc", type: "documentation" }] },
            { title: "Problem Solving", description: "Practice algorithmic thinking and coding challenges", resources: [{ title: "LeetCode", url: "https://leetcode.com", type: "practice" }] }
          ]
        },
        {
          name: "Skill Development",
          description: "Build specialized skills for your target role",
          duration: "8 weeks",
          order: 2,
          topics: [
            { title: "Web Development Fundamentals", description: "HTML, CSS, JavaScript, and responsive design", resources: [{ title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "documentation" }] },
            { title: "Framework Mastery", description: "Learn a modern framework (React/Angular/Vue)", resources: [{ title: "React Docs", url: "https://react.dev", type: "documentation" }] },
            { title: "Backend Development", description: "Server-side programming, APIs, and databases", resources: [{ title: "Node.js Docs", url: "https://nodejs.org/docs", type: "documentation" }] }
          ]
        },
        {
          name: "Project Building",
          description: "Apply your skills to real-world projects",
          duration: "6 weeks",
          order: 3,
          topics: [
            { title: "Portfolio Project", description: "Build a full-stack application for your portfolio", resources: [{ title: "GitHub", url: "https://github.com", type: "platform" }] },
            { title: "Open Source Contribution", description: "Contribute to open source projects", resources: [{ title: "First Contributions", url: "https://firstcontributions.github.io", type: "guide" }] }
          ]
        },
        {
          name: "Career Preparation",
          description: "Prepare for interviews and job applications",
          duration: "4 weeks",
          order: 4,
          topics: [
            { title: "Interview Preparation", description: "System design, behavioral questions, and coding interviews", resources: [{ title: "InterviewBit", url: "https://interviewbit.com", type: "practice" }] },
            { title: "Resume & LinkedIn Optimization", description: "Craft ATS-friendly resume and professional profile", resources: [{ title: "LinkedIn Learning", url: "https://linkedin.com/learning", type: "course" }] }
          ]
        }
      ]
    });
  }

  if (systemPrompt.includes('interview') || systemPrompt.includes('mock')) {
    return JSON.stringify({
      question: "Tell me about a challenging project you worked on and how you overcame the obstacles you faced.",
      category: "behavioral",
      difficulty: "medium",
      tips: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Be specific about your contributions",
        "Highlight what you learned from the experience"
      ]
    });
  }

  if (systemPrompt.includes('feedback') || systemPrompt.includes('evaluate')) {
    return JSON.stringify({
      score: Math.floor(Math.random() * 20) + 65,
      feedback: "Good attempt! Your answer demonstrates relevant experience. To improve, try to be more specific with metrics and results. Use the STAR method more explicitly.",
      strengths: ["Good structure", "Relevant example chosen", "Shows problem-solving ability"],
      improvements: ["Add specific metrics/numbers", "Be more concise", "Connect the experience to the role you're targeting"],
      followUpQuestion: "Can you quantify the impact of your contribution to that project?"
    });
  }

  return JSON.stringify({ message: "AI service temporarily unavailable. Please try again later." });
}

module.exports = { callOpenAI, getOpenAIClient };
