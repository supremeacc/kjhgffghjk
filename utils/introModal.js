const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function createIntroModal(prefillData = {}) {
  const modal = new ModalBuilder()
    .setCustomId('intro_modal')
    .setTitle('🎓 Introduce Yourself');

  const nameInput = new TextInputBuilder()
    .setCustomId('intro_name')
    .setLabel('Your Name')
    .setPlaceholder('e.g., Rahul Sharma')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);
  
  if (prefillData.name) nameInput.setValue(prefillData.name);

  const roleInput = new TextInputBuilder()
    .setCustomId('intro_role')
    .setLabel('Role / Study')
    .setPlaceholder('e.g., CS Student, ML Engineer, AI Enthusiast')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(150);
  
  if (prefillData.role) roleInput.setValue(prefillData.role);

  const institutionInput = new TextInputBuilder()
    .setCustomId('intro_institution')
    .setLabel('Institution / Organization')
    .setPlaceholder('e.g., IIT Delhi, Google, Freelancer')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(150);
  
  if (prefillData.institution) institutionInput.setValue(prefillData.institution);

  const interestsInput = new TextInputBuilder()
    .setCustomId('intro_interests')
    .setLabel('Interests (AI Fields or Tools)')
    .setPlaceholder('e.g., Machine Learning, NLP, LLMs, Computer Vision')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);
  
  if (prefillData.interests) interestsInput.setValue(prefillData.interests);

  const detailsInput = new TextInputBuilder()
    .setCustomId('intro_details')
    .setLabel('Skills, Experience Level & Goals')
    .setPlaceholder('Skills, level, goals, GitHub/portfolio (e.g., Python pro, building AI chatbot)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMinLength(50)
    .setMaxLength(1000);
  
  if (prefillData.details) detailsInput.setValue(prefillData.details);

  const row1 = new ActionRowBuilder().addComponents(nameInput);
  const row2 = new ActionRowBuilder().addComponents(roleInput);
  const row3 = new ActionRowBuilder().addComponents(institutionInput);
  const row4 = new ActionRowBuilder().addComponents(interestsInput);
  const row5 = new ActionRowBuilder().addComponents(detailsInput);

  modal.addComponents(row1, row2, row3, row4, row5);

  return modal;
}

module.exports = {
  createIntroModal
};
