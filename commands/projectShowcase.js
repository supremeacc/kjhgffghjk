const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadProjectData } = require('../utils/projectManager');
const { createShowcaseEmbed } = require('../utils/projectEmbeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('project-showcase')
    .setDescription('Post a project to the showcase channel (Admin only)')
    .addUserOption(option =>
      option.setName('owner')
        .setDescription('The project owner')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post the showcase')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const owner = interaction.options.getUser('owner');
    const showcaseChannel = interaction.options.getChannel('channel');

    if (!showcaseChannel.isTextBased()) {
      await interaction.editReply({
        content: '❌ Please select a text channel!'
      });
      return;
    }

    const projectData = loadProjectData();
    const project = Object.values(projectData.projects).find(p => p.ownerId === owner.id);

    if (!project) {
      await interaction.editReply({
        content: `❌ No active project found for ${owner.tag}`
      });
      return;
    }

    try {
      const showcaseEmbed = createShowcaseEmbed(project, owner.id);

      await showcaseChannel.send({
        content: `🚀 **New Project Alert!** <@${owner.id}>`,
        embeds: [showcaseEmbed]
      });

      await interaction.editReply({
        content: `✅ Project showcased in <#${showcaseChannel.id}>!`
      });

      console.log(`✅ Showcased project ${project.name} by ${owner.tag}`);
    } catch (error) {
      console.error('❌ Error posting showcase:', error);
      await interaction.editReply({
        content: '❌ Failed to post showcase. Check bot permissions.'
      });
    }
  }
};
