const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { resetConfig, loadConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-reset')
    .setDescription('Reset bot configuration (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const currentConfig = loadConfig();
      
      if (!currentConfig.setupComplete) {
        await interaction.editReply({
          content: '⚠️ The bot is not currently configured. Use `/setup-bot` to set it up first.'
        });
        return;
      }

      const row = {
        type: 1,
        components: [
          {
            type: 2,
            style: 4,
            label: 'Confirm Reset',
            custom_id: 'confirm_reset',
            emoji: { name: '🗑️' }
          },
          {
            type: 2,
            style: 2,
            label: 'Cancel',
            custom_id: 'cancel_reset',
            emoji: { name: '❌' }
          }
        ]
      };

      const currentEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⚠️ Reset Bot Configuration?')
        .setDescription('This will clear all bot settings. You will need to run `/setup-bot` again.\n\n**Current Configuration:**')
        .addFields(
          { name: '📝 Intro Channel', value: currentConfig.introChannelId ? `<#${currentConfig.introChannelId}>` : 'Not set', inline: true },
          { name: '📋 Profile Channel', value: currentConfig.profileChannelId ? `<#${currentConfig.profileChannelId}>` : 'Not set', inline: true },
          { name: '👮 Moderator Role', value: currentConfig.moderatorRoleId ? `<@&${currentConfig.moderatorRoleId}>` : 'Not set', inline: true }
        )
        .setFooter({ text: 'This action cannot be undone!' });

      await interaction.editReply({
        embeds: [currentEmbed],
        components: [row]
      });

      const filter = i => i.user.id === interaction.user.id && 
                          (i.customId === 'confirm_reset' || i.customId === 'cancel_reset');

      try {
        const buttonInteraction = await interaction.channel.awaitMessageComponent({
          filter,
          time: 30000
        });

        if (buttonInteraction.customId === 'confirm_reset') {
          const success = resetConfig();
          
          if (success) {
            await buttonInteraction.update({
              embeds: [
                new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle('🗑️ Configuration Reset')
                  .setDescription('Bot configuration has been cleared successfully.\n\nRun `/setup-bot` to configure the bot again.')
                  .setFooter({ text: `Reset by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                  .setTimestamp()
              ],
              components: []
            });
            console.log(`🗑️ Bot configuration reset by ${interaction.user.tag}`);
          } else {
            await buttonInteraction.update({
              content: '❌ Failed to reset configuration. Please try again.',
              embeds: [],
              components: []
            });
          }
        } else {
          await buttonInteraction.update({
            embeds: [
              new EmbedBuilder()
                .setColor('#4A90E2')
                .setTitle('❌ Reset Cancelled')
                .setDescription('Bot configuration was not changed.')
            ],
            components: []
          });
        }
      } catch (timeoutError) {
        await interaction.editReply({
          content: '⏱️ Reset confirmation timed out. Configuration was not changed.',
          embeds: [],
          components: []
        });
      }

    } catch (error) {
      console.error('❌ Error in /setup-reset:', error);
      await interaction.editReply({
        content: '❌ An error occurred while resetting the configuration.'
      });
    }
  }
};
