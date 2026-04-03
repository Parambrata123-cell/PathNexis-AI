const { callOpenAI } = require('./openai');

const analyzeResume = async (resumeText, targetRole = '', targetIndustry = '') => {
  const systemPrompt = `You are an expert resume analyzer and ATS (Applicant Tracking System) specialist. 
Analyze the provided resume and return a detailed JSON response with the following structure:
{
  "atsScore": <number 0-100>,
  "overallFeedback": "<comprehensive feedback string>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "suggestions": ["<suggestion1>", "<suggestion2>", ...],
  "keywordMatch": <number 0-100>,
  "formattingScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "educationScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "detectedSkills": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<skill1>", "<skill2>", ...],
  "industryFit": "<industry string>"
}
Return ONLY valid JSON, no markdown formatting or extra text.`;

  const userPrompt = `Analyze this resume for ATS compatibility${targetRole ? ` for the role of ${targetRole}` : ''}${targetIndustry ? ` in the ${targetIndustry} industry` : ''}:

${resumeText}`;

  const result = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.3, maxTokens: 2000 });
  
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse resume analysis:', e.message);
    return JSON.parse(result);
  }
};

module.exports = { analyzeResume };
