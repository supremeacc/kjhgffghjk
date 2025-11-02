const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { createApplicationEmbed } = require('../utils/projectEmbeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-apply-button')
    .setDescription('Set up the project application button (Admin only)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where the apply button should be posted')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel');

    if (!targetChannel.isTextBased()) {
      await interaction.reply({
        content: '❌ Please select a text channel!',
        ephemeral: true
      });
      return;
    }

    try {
      const embed = createApplicationEmbed();

      const applyButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('project_apply')
            .setLabel('Apply')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🚀')
        );

      await targetChannel.send({
        embeds: [embed],
        components: [applyButton]
      });

      await interaction.reply({
        content: `✅ Application button successfully posted in <#${targetChannel.id}>!`,
        ephemeral: true
      });

      console.log(`✅ Setup apply button in channel ${targetChannel.name} by ${interaction.user.tag}`);
    } catch (error) {
      console.error('❌ Error setting up apply button:', error);
      await interaction.reply({
        content: '❌ Failed to post the application button. Please check bot permissions.',
        ephemeral: true
      });
    }
  }
};
