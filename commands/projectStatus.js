const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserProject } = require('../utils/projectManager');
const { getProjectColor } = require('../utils/projectEmbeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('project-status')
    .setDescription('View your project information'),

  async execute(interaction) {
    const project = getUserProject(interaction.user.id);

    if (!project) {
      await interaction.reply({
        content: '❌ You don\'t have an active project. Apply for one using the Apply button!',
        ephemeral: true
      });
      return;
    }

    const createdDate = new Date(project.createdAt).toLocaleDateString();
    const lastActivityDate = new Date(project.lastActivity).toLocaleDateString();
    const daysActive = Math.floor((Date.now() - project.createdAt) / (1000 * 60 * 60 * 24));

    const embed = new EmbedBuilder()
      .setTitle(`📊 Project Status: ${project.name}`)
      .setDescription(project.description || 'No description provided')
      .addFields(
        { name: '🎯 Type', value: project.type, inline: true },
        { name: '📅 Created', value: createdDate, inline: true },
        { name: '⏰ Days Active', value: daysActive.toString(), inline: true },
        { name: '👥 Team Size', value: (project.teammates.length + 1).toString(), inline: true },
        { name: '📈 Status', value: project.status.toUpperCase(), inline: true },
        { name: '🕐 Last Activity', value: lastActivityDate, inline: true }
      )
      .setColor(getProjectColor(project.type))
      .setFooter({ text: 'Verified by AI Learners India Bot 🤖' })
      .setTimestamp();

    if (project.teammates.length > 0) {
      embed.addFields({
        name: '🤝 Teammates',
        value: project.teammates.map(id => `<@${id}>`).join(', '),
        inline: false
      });
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
