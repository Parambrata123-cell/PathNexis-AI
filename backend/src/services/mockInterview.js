const { callOpenAI } = require('./openai');

const generateQuestion = async (role, difficulty = 'medium', category = 'mixed', previousQuestions = []) => {
  const systemPrompt = `You are an expert technical interviewer conducting a mock interview.
Generate a single interview question as JSON:
{
  "question": "<the interview question>",
  "category": "<technical|behavioral|situational|system-design>",
  "difficulty": "<easy|medium|hard>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"],
  "expectedDuration": "<e.g., 2-3 minutes>"
}
Return ONLY valid JSON.`;

  const userPrompt = `Generate a ${difficulty} ${category} interview question for a ${role} position.
${previousQuestions.length > 0 ? `Avoid these already asked questions: ${previousQuestions.join('; ')}` : ''}`;

  const result = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.8, maxTokens: 500 });
  
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return JSON.parse(result);
  }
};

const evaluateAnswer = async (question, answer, role) => {
  const systemPrompt = `You are an expert interviewer evaluating a candidate's answer.
Provide structured feedback as JSON:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "followUpQuestion": "<a relevant follow-up question>"
}
Return ONLY valid JSON.`;

  const userPrompt = `Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}

Evaluate this answer considering relevance, depth, clarity, and structure.`;

  const result = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.4, maxTokens: 1000 });
  
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return JSON.parse(result);
  }
};

module.exports = { generateQuestion, evaluateAnswer };
