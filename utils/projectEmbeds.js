const { EmbedBuilder } = require('discord.js');

const PROJECT_TYPE_COLORS = {
  'AI Research': 0x1E90FF,
  'Automation': 0xFF8C00,
  'Startup': 0x9B59B6,
  'Study Group': 0x00FF7F,
  'Other': 0x95A5A6
};

function getProjectColor(projectType) {
  return PROJECT_TYPE_COLORS[projectType] || PROJECT_TYPE_COLORS['Other'];
}

function createApplicationEmbed() {
  return new EmbedBuilder()
    .setTitle('🚀 Start Your Own AI Project Space!')
    .setDescription('Tap the **Apply** button below to create a private space for your startup, project, or study group.\n\n' +
      '✨ You\'ll get:\n' +
      '• Private text and voice channels\n' +
      '• Teammate collaboration tools\n' +
      '• Dedicated project workspace\n' +
      '• Moderator support')
    .setColor(0x00FF7F)
    .setFooter({ text: 'Verified by AI Learners India Bot 🤖' })
    .setTimestamp();
}

function createVerificationEmbed(applicant, applicationData) {
  const embed = new EmbedBuilder()
    .setTitle('📋 New Project Application')
    .setDescription(`<@${applicant.id}> has submitted a project application for review.`)
    .addFields(
      { name: '🏷️ Project Name', value: applicationData.projectName, inline: false },
      { name: '💡 Description', value: applicationData.description, inline: false },
      { name: '🎯 Project Type', value: applicationData.projectType, inline: true }
    )
    .setColor(getProjectColor(applicationData.projectType))
    .setThumbnail(applicant.displayAvatarURL())
    .setFooter({ text: 'Verified by AI Learners India Bot 🤖' })
    .setTimestamp();

  if (applicationData.teammates && applicationData.teammates.length > 0) {
    embed.addFields({
      name: '👥 Initial Teammates',
      value: applicationData.teammates.map(id => `<@${id}>`).join(', '),
      inline: false
    });
  }

  return embed;
}

function createWelcomeEmbed(projectName, projectType, owner) {
  return new EmbedBuilder()
    .setTitle(`🎉 Welcome to ${projectName}!`)
    .setDescription(`This is your private project space. Get started building something amazing!\n\n` +
      `**Project Lead:** <@${owner}>\n` +
      `**Type:** ${projectType}\n\n` +
      `**Quick Commands:**\n` +
      `• \`/add-teammate\` - Invite collaborators\n` +
      `• \`/project-status\` - View project info\n\n` +
      `Stay active and share your progress! 🚀`)
    .setColor(getProjectColor(projectType))
    .setFooter({ text: 'Verified by AI Learners India Bot 🤖' })
    .setTimestamp();
}

function createShowcaseEmbed(project, creator) {
  const embed = new EmbedBuilder()
    .setTitle('🧩 New Project Launched!')
    .setDescription(`**${project.name}** by <@${creator}>`)
    .addFields(
      { name: '🎯 Type', value: project.type, inline: true },
      { name: '💡 Description', value: project.description || 'No description provided', inline: false }
    )
    .setColor(getProjectColor(project.type))
    .setFooter({ text: 'Verified by AI Learners India Bot 🤖' })
    .setTimestamp();

  if (project.teammates && project.teammates.length > 0) {
    embed.addFields({
      name: '👥 Team',
      value: project.teammates.map(id => `<@${id}>`).join(', '),
      inline: false
    });
  }

  return embed;
}

function createInactivityWarningEmbed(projectName, daysInactive) {
  return new EmbedBuilder()
    .setTitle('⚠️ Project Inactivity Notice')
    .setDescription(`Your project **${projectName}** has been inactive for ${daysInactive} days.\n\n` +
      `Would you like to:\n` +
      `• Keep it active? - Just send a message in your project channel\n` +
      `• Archive it? - We'll move it to archived projects\n\n` +
      `If we don't hear from you in 3 days, the project will be automatically archived.`)
    .setColor(0xFF8C00)
    .setFooter({ text: 'AI Learners India Bot' })
    .setTimestamp();
}

module.exports = {
  getProjectColor,
  createApplicationEmbed,
  createVerificationEmbed,
  createWelcomeEmbed,
  createShowcaseEmbed,
  createInactivityWarningEmbed
};
