const { callOpenAI } = require('./openai');

const generateRoadmap = async (careerGoal, currentSkills = [], currentLevel = 'beginner') => {
  const systemPrompt = `You are a career counselor and learning roadmap expert specializing in helping Tier 3 and Tier 4 college students in India.
Create a detailed, personalized learning roadmap as JSON with this structure:
{
  "title": "<roadmap title>",
  "description": "<brief description>",
  "estimatedDuration": "<e.g., 6 months>",
  "phases": [
    {
      "name": "<phase name>",
      "description": "<phase description>",
      "duration": "<e.g., 4 weeks>",
      "order": <number>,
      "topics": [
        {
          "title": "<topic title>",
          "description": "<what to learn>",
          "resources": [
            { "title": "<resource name>", "url": "<url>", "type": "<course|video|documentation|practice|book>" }
          ]
        }
      ]
    }
  ]
}
Focus on FREE resources. Include practical projects. Return ONLY valid JSON.`;

  const userPrompt = `Create a personalized learning roadmap for:
- Career Goal: ${careerGoal}
- Current Level: ${currentLevel}
- Existing Skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'None specified'}

The student is from a Tier 3/4 college in India and needs a practical, achievable roadmap with free resources.`;

  const result = await callOpenAI(systemPrompt, userPrompt, { temperature: 0.5, maxTokens: 3000 });
  
  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse roadmap:', e.message);
    return JSON.parse(result);
  }
};

module.exports = { generateRoadmap };
