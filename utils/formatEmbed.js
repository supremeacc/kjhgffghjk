const { EmbedBuilder } = require('discord.js');

function ensureString(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

function formatEmbed(fields, username, userAvatarUrl = null, userId = null) {
  const colors = [
    0x5865F2,
    0x57F287,
    0xFEE75C,
    0xEB459E,
    0xED4245,
    0x3498DB,
    0x9B59B6,
    0x1ABC9C
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const embedFields = [
    { name: '🎓 Name', value: fields['Name'], inline: false },
    { name: '💼 Role / Study', value: fields['Role / Study'], inline: false },
    { name: '🏢 Institution / Organization', value: fields['Institution / Organization'], inline: false },
    { name: '🤖 Interests', value: fields['Interests (AI Fields or Tools)'], inline: false },
    { name: '🧠 Skills', value: fields['Skills (Programming, Platforms, etc.)'], inline: false },
    { name: '📊 Experience Level', value: fields['Experience Level (Beginner / Intermediate / Advanced)'], inline: true },
    { name: '🚀 Goal', value: fields['Goal or What You Want to Build'], inline: false }
  ];

  if (fields['Portfolio / GitHub / LinkedIn']) {
    embedFields.push({ name: '🔗 Links', value: fields['Portfolio / GitHub / LinkedIn'], inline: false });
  }

  const embed = new EmbedBuilder()
    .setTitle('🎓 Member Introduction')
    .setColor(randomColor)
    .addFields(embedFields)
    .setFooter({ text: `👤 Added by ${username}` })
    .setTimestamp();

  if (userAvatarUrl) {
    embed.setThumbnail(userAvatarUrl);
  }

  return embed;
}

function formatAIEnhancedEmbed(fields, geminiAnalysis, username, userAvatarUrl, userId = null) {
  let embedColor;
  
  if (geminiAnalysis.color && geminiAnalysis.color.startsWith('#')) {
    embedColor = parseInt(geminiAnalysis.color.replace('#', ''), 16);
  } else {
    const experienceColors = {
      'beginner': 0x00FF7F,
      'intermediate': 0xFFD700,
      'advanced': 0xFF0000
    };
    embedColor = experienceColors[geminiAnalysis.experience_level.toLowerCase()] || 0x1E90FF;
  }

  const roleEmoji = {
    'beginner': '🟢 Learner',
    'intermediate': '🟡 Builder',
    'advanced': '🔴 Expert'
  };

  const assignedRole = roleEmoji[geminiAnalysis.experience_level.toLowerCase()] || '⚪ Member';

  const userMention = userId ? `<@${userId}>` : `@${username}`;
  const description = `${userMention}\n\n${geminiAnalysis.refined_intro}`;

  const embedFields = [
    { name: '🎓 Name', value: ensureString(geminiAnalysis.name), inline: false },
    { name: '💼 Role / Study', value: ensureString(geminiAnalysis.role), inline: false },
    { name: '🏫 Institution', value: ensureString(geminiAnalysis.institution), inline: false },
    { name: '🤖 Interests', value: ensureString(geminiAnalysis.interests), inline: false },
    { name: '🧠 Skills', value: ensureString(geminiAnalysis.skills), inline: false },
    { name: '🚀 Goal', value: ensureString(geminiAnalysis.goal), inline: false }
  ];

  if (geminiAnalysis.portfolio && geminiAnalysis.portfolio !== 'Not provided') {
    embedFields.push({ name: '🔗 Links', value: geminiAnalysis.portfolio, inline: false });
  }

  const embed = new EmbedBuilder()
    .setTitle('🎓 Member Introduction')
    .setDescription(description)
    .setColor(embedColor)
    .addFields(embedFields)
    .setFooter({ text: '🧩 Verified by AI Learners India Bot 🤖' })
    .setTimestamp();

  if (userAvatarUrl) {
    embed.setThumbnail(userAvatarUrl);
  }

  return embed;
}

module.exports = { formatEmbed, formatAIEnhancedEmbed };
