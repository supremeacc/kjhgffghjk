const requiredFields = [
  { name: 'Name', optional: false },
  { name: 'Role / Study', optional: false },
  { name: 'Institution / Organization', optional: false },
  { name: 'Interests (AI Fields or Tools)', optional: false },
  { name: 'Skills (Programming, Platforms, etc.)', optional: false },
  { name: 'Experience Level (Beginner / Intermediate / Advanced)', optional: false },
  { name: 'Goal or What You Want to Build', optional: false },
  { name: 'Portfolio / GitHub / LinkedIn', optional: true }
];

function validateIntro(message) {
  const content = message.trim();
  
  if (content.length < 20) {
    return {
      isValid: false,
      isTooShort: true,
      fields: {},
      missingFields: []
    };
  }

  const lowerContent = content.toLowerCase();
  const offTopicKeywords = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you', 'thanks', 'thank you'];
  const introKeywords = ['name', 'study', 'student', 'skills', 'goal', 'build', 'learn', 'work', 'interest', 'experience'];
  
  const hasOffTopicOnly = offTopicKeywords.some(keyword => lowerContent.includes(keyword)) && 
                          !introKeywords.some(keyword => lowerContent.includes(keyword));
  
  if (hasOffTopicOnly && content.split(' ').length < 10) {
    return {
      isValid: false,
      isOffTopic: true,
      fields: {},
      missingFields: []
    };
  }

  return {
    isValid: true,
    needsAIProcessing: true,
    fields: {},
    missingFields: []
  };
}

module.exports = { validateIntro, requiredFields };
