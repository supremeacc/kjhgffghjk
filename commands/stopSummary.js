const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { getActiveSession, endSession } = require('../utils/voiceSessionManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop-summary')
    .setDescription('Stop the voice recording without generating a summary'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const session = getActiveSession(interaction.guildId);

      if (!session) {
        await interaction.editReply({
          content: '❌ No active recording session found! Use `/join-vc-summary` first to start recording.'
        });
        return;
      }

      const connection = getVoiceConnection(interaction.guildId);
      if (connection) {
        connection.destroy();
        console.log('🛑 Voice connection destroyed (stopped without summary)');
      }

      endSession(interaction.guildId);

      await interaction.editReply({
        content: '✅ **Recording stopped successfully!**\n\nThe session has been ended without generating a summary.'
      });

      await interaction.channel.send({
        content: `🛑 **Recording Stopped**\n\nInitiated by: <@${interaction.user.id}>\n\nThe recording has been stopped without generating a summary.`
      });

      console.log(`✅ Recording stopped by ${interaction.user.tag} without summary`);

    } catch (error) {
      console.error('❌ Error in /stop-summary:', error);
      await interaction.editReply({
        content: '🛠️ Something went wrong while stopping the recording. Please retry.'
      });
    }
  }
};
