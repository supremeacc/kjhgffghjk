const { SlashCommandBuilder } = require('discord.js');
const { setLanguagePreference, getLanguagePreference } = require('../utils/voiceSessionManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summary-mode')
    .setDescription('Set language preference for meeting summaries')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Choose language mode for summaries')
        .setRequired(true)
        .addChoices(
          { name: 'Auto (Detect language automatically)', value: 'auto' },
          { name: 'English', value: 'english' },
          { name: 'Hindi', value: 'hindi' },
          { name: 'Hinglish (Mix of Hindi & English)', value: 'hinglish' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const mode = interaction.options.getString('mode');
      
      setLanguagePreference(interaction.guildId, interaction.user.id, mode);

      const modeDisplay = {
        'auto': 'Auto (detects language automatically)',
        'english': 'English',
        'hindi': 'Hindi',
        'hinglish': 'Hinglish (mix of Hindi & English)'
      }[mode];

      await interaction.editReply({
        content: `✅ **Language preference updated!**\n\nYour meeting summaries will now be generated in: **${modeDisplay}**\n\nThis setting will apply to all future `/summarize-vc` commands you run.`
      });

      console.log(`📝 ${interaction.user.tag} set summary mode to: ${mode}`);

    } catch (error) {
      console.error('❌ Error in /summary-mode:', error);
      await interaction.editReply({
        content: '🛠️ Something went wrong while updating your preference. Please retry.'
      });
    }
  }
};
