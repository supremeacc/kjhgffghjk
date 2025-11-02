const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function summarizeMeeting(transcripts, sessionInfo, languageMode = 'auto') {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    console.log('🤖 Generating meeting summary with Gemini AI...');
    
    const combinedTranscript = transcripts
      .map((t, index) => `[Participant ${index + 1}]: ${t.text || t}`)
      .join('\n\n');
    
    const duration = sessionInfo.endTime && sessionInfo.startTime 
      ? Math.round((sessionInfo.endTime - sessionInfo.startTime) / 60000) 
      : 'Unknown';
    
    const languageInstruction = languageMode === 'auto' 
      ? 'Detect if the conversation is in English, Hindi, or Hinglish. Generate the summary in the same language/tone as detected.'
      : `Generate the summary in ${languageMode === 'hinglish' ? 'Hinglish (mix of Hindi and English)' : languageMode}.`;
    
    const prompt = `You are an AI meeting assistant for the AI Learners India community. Analyze this voice channel conversation.

Voice Channel Meeting Transcript:
${combinedTranscript}

Meeting Duration: ${duration} minutes
Participants: ${sessionInfo.participants.length} people

${languageInstruction}

Provide a CONCISE Minutes of Meeting (MoM) summary with:

1. OVERVIEW: 1-2 sentences summarizing the meeting (in detected language)

2. KEY TOPICS: 3-5 bullet points of major topics discussed (keep each under 10 words)

3. DECISIONS: Any concrete decisions made (or "None")

4. ACTION ITEMS: Specific tasks with people mentioned if detected (or "None")

5. NEXT STEPS: 1-2 next actions (or "None")

6. LANGUAGE DETECTED: One of: "English", "Hindi", "Hinglish"

7. MEETING TONE: Analyze keywords and classify as:
   - "productive" (keywords: plan, launch, finished, completed, decided, agreed)
   - "brainstorming" (keywords: idea, discuss, maybe, could, should, thinking)
   - "blockers" (keywords: issue, problem, stuck, error, failed, confused)

Keep the ENTIRE summary under 10 lines total. Be concise and clear.

For Hinglish example: "Team ne kal tak model deploy karne aur report bhejne ka plan banaya."

Format as JSON:
{
  "overview": "string",
  "discussion_points": ["string"],
  "decisions": ["string"],
  "action_items": ["string"],
  "next_steps": ["string"],
  "language_detected": "English|Hindi|Hinglish",
  "meeting_tone": "productive|brainstorming|blockers"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            discussion_points: { 
              type: 'array',
              items: { type: 'string' }
            },
            decisions: { 
              type: 'array',
              items: { type: 'string' }
            },
            action_items: { 
              type: 'array',
              items: { type: 'string' }
            },
            next_steps: { 
              type: 'array',
              items: { type: 'string' }
            },
            language_detected: {
              type: 'string',
              enum: ['English', 'Hindi', 'Hinglish']
            },
            meeting_tone: {
              type: 'string',
              enum: ['productive', 'brainstorming', 'blockers']
            }
          },
          required: ['overview', 'discussion_points', 'decisions', 'action_items', 'next_steps', 'language_detected', 'meeting_tone']
        }
      }
    });

    const summaryData = JSON.parse(response.text());
    
    console.log(`✅ Meeting summary generated (${summaryData.language_detected}, ${summaryData.meeting_tone})`);
    
    return {
      success: true,
      summary: summaryData,
      rawTranscript: combinedTranscript,
      language: summaryData.language_detected,
      tone: summaryData.meeting_tone
    };
    
  } catch (error) {
    console.error('❌ Error generating meeting summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  summarizeMeeting
};
