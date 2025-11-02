const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function transcribeAudio(audioFilePath) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Gemini API key not configured'
    };
  }

  try {
    console.log(`🎙️ Transcribing audio file: ${audioFilePath}`);
    
    const audioBytes = fs.readFileSync(audioFilePath);
    const base64Audio = audioBytes.toString('base64');
    
    const prompt = `Transcribe this audio recording. Provide a clear, accurate transcription of all spoken words. If there are multiple speakers, try to distinguish between them. If the audio is unclear or inaudible, note that in the transcript.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'audio/mp3',
                data: base64Audio
              }
            }
          ]
        }
      ]
    });

    const transcriptText = response.text();
    
    console.log('✅ Transcription completed');
    
    return {
      success: true,
      transcript: transcriptText
    };
    
  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function transcribeMultipleAudio(audioFiles) {
  const transcripts = [];
  
  for (const file of audioFiles) {
    const result = await transcribeAudio(file);
    if (result.success) {
      transcripts.push(result.transcript);
    }
  }
  
  return transcripts;
}

module.exports = {
  transcribeAudio,
  transcribeMultipleAudio
};
