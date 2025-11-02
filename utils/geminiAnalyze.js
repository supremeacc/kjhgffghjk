const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function analyzeIntro(introText) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    console.log('🤖 Sending intro to Gemini for AI analysis...');
    
    const prompt = `You are an AI assistant that extracts and structures user introduction information from ANY format.

Analyze this introduction text and extract the following information semantically (not word-for-word matching):

User Introduction:
${introText}

Extract and structure:
1. Name: The person's name (if not found, try to infer or use "Not provided")
2. Role/Study: What they do or study (student, developer, engineer, etc.)
3. Institution: School, university, or company they're associated with
4. Interests: AI fields, technologies, or tools they're interested in
5. Skills: Programming languages, platforms, tools they know
6. Experience Level: Assess as "beginner", "intermediate", or "advanced" based on their skills and description
7. Goal: What they want to build or achieve
8. Portfolio: Any GitHub, LinkedIn, portfolio links mentioned (or "Not provided")

Also create a refined 2-3 sentence summary with corrected spelling and grammar.
IMPORTANT: Write the summary in THIRD PERSON, always starting with the member's name.
Focus on their study/work background, interests, and goals in a professional, engaging style.

Example:
- ❌ "I am Riya, a student studying AI."
- ✅ "Riya is a computer science student passionate about Artificial Intelligence and automation."

Respond with JSON containing:
- name: Extracted name
- role: Role or study area
- institution: Institution or organization
- interests: AI interests and tools (as comma-separated string)
- skills: Technical skills (as comma-separated string)
- experience_level: "beginner", "intermediate", or "advanced"
- goal: Their goal or what they want to build
- portfolio: Links if any, otherwise "Not provided"
- refined_intro: Polished summary in THIRD PERSON (2-3 sentences, starting with the person's name)
- color: "#00FF7F" for beginner, "#FFD700" for intermediate, "#FF0000" for advanced`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
            institution: { type: 'string' },
            interests: { type: 'string' },
            skills: { type: 'string' },
            experience_level: { 
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced']
            },
            goal: { type: 'string' },
            portfolio: { type: 'string' },
            refined_intro: { type: 'string' },
            color: { type: 'string' }
          },
          required: ['name', 'role', 'institution', 'interests', 'skills', 'experience_level', 'goal', 'portfolio', 'refined_intro', 'color']
        }
      }
    });
    
    let jsonText = response.text;
    
    console.log('✅ Gemini analysis received');
    console.log(`Raw response: ${jsonText}`);
    
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let firstBrace = jsonText.indexOf('{');
    let lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log(`Cleaned JSON: ${jsonText}`);
    
    const analysis = JSON.parse(jsonText);
    
    return {
      success: true,
      data: analysis
    };
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function getExperienceColor(experienceLevel) {
  const colorMap = {
    'beginner': 0x57F287,
    'intermediate': 0xFEE75C,
    'expert': 0xED4245
  };
  
  return colorMap[experienceLevel.toLowerCase()] || 0x5865F2;
}

module.exports = {
  analyzeIntro,
  getExperienceColor
};
