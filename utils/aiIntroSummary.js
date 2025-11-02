const { GoogleGenerativeAI } = require('@google/genai');

let genAI = null;

function initializeAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google Gemini AI initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error.message);
    }
  }
  return genAI;
}

async function generateIntroSummary(introData) {
  const ai = initializeAI();
  
  if (!ai) {
    console.error('❌ Gemini AI not initialized');
    return {
      success: false,
      error: 'AI service not available',
      fallback: createFallbackSummary(introData)
    };
  }

  try {
    console.log('🤖 Generating AI summary for introduction...');

    const prompt = `You are a friendly AI assistant for AI Learners India community. Create a casual, natural summary of this member's introduction.

Introduction:
Name: ${introData.name || 'Not provided'}
Role/Study: ${introData.role || 'Not provided'}
Institution: ${introData.institution || 'Not specified'}
Interests: ${introData.interests || 'Not provided'}
Details: ${introData.details || 'Not provided'}

Task:
1. Write a 2-3 sentence casual summary in Hinglish or English (match their input language naturally)
2. Describe who they are, what they're interested in, and what they want to learn/build
3. Keep it conversational and friendly - like introducing someone at a meetup
4. Determine experience level: "Beginner" (just starting), "Builder" (intermediate), or "Pro" (advanced/professional)
5. Extract their skills if mentioned

Return ONLY valid JSON (no markdown):
{
  "summary": "Casual 2-3 sentence Hinglish/English introduction",
  "experienceLevel": "Beginner",
  "skills": "Extracted skills or Not specified"
}`;

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    
    let responseText = '';
    
    if (result.response && typeof result.response.text === 'function') {
      responseText = await result.response.text();
    } else if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = result.response.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unable to extract response from Gemini');
    }

    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from Gemini');
    }

    const cleaned = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*({)/s, '$1')
      .replace(/(})[^}]*$/s, '$1')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn('⚠️ JSON parse failed, using text as summary');
      parsed = {
        summary: responseText.slice(0, 400),
        experienceLevel: 'Beginner',
        skills: 'Not specified'
      };
    }

    const validLevels = ['Beginner', 'Builder', 'Pro'];
    const experienceLevel = validLevels.includes(parsed.experienceLevel) 
      ? parsed.experienceLevel 
      : 'Beginner';

    const fallback = createFallbackSummary(introData);
    const summary = parsed.summary || fallback.summary;
    const skills = parsed.skills || fallback.skills;

    console.log(`✅ AI summary generated - Level: ${experienceLevel}`);

    return {
      success: true,
      summary,
      experienceLevel,
      skills
    };

  } catch (error) {
    console.error('❌ Error generating AI summary:', error.message);
    
    return {
      success: false,
      error: error.message,
      fallback: createFallbackSummary(introData)
    };
  }
}

function createFallbackSummary(introData) {
  const name = introData.name || 'This member';
  const interests = introData.interests || 'AI and technology';
  
  return {
    summary: `${name} is interested in ${interests} and wants to learn and grow in the AI community.`,
    experienceLevel: 'Beginner',
    skills: 'Not specified'
  };
}

function getExperienceColor(level) {
  const colors = {
    'Beginner': 0x00FF7F,
    'Builder': 0xFFD700,
    'Pro': 0xFF0000
  };
  return colors[level] || 0x4A90E2;
}

function getExperienceEmoji(level) {
  const emojis = {
    'Beginner': '🟢',
    'Builder': '🟡',
    'Pro': '🔴'
  };
  return emojis[level] || '🔵';
}

module.exports = {
  generateIntroSummary,
  getExperienceColor,
  getExperienceEmoji
};
