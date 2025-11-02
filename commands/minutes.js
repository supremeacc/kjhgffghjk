const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getLastSession } = require('../utils/voiceSessionManager');
const { generateMeetingMinutesPDF } = require('../utils/pdfGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minutes')
    .setDescription('Download PDF meeting minutes from the last VC summary'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const lastSession = getLastSession(interaction.guildId);

      if (!lastSession) {
        await interaction.editReply({
          content: '❌ No meeting session found! Use `/join-vc-summary` and `/summarize-vc` first to create a meeting summary.'
        });
        return;
      }

      if (!lastSession.lastSummary) {
        await interaction.editReply({
          content: '❌ No summary available for the last session. Please run `/summarize-vc` first.'
        });
        return;
      }

      await interaction.editReply({
        content: '⏳ Generating PDF meeting minutes... This will take a moment.'
      });

      console.log(`📄 Generating PDF for session ${lastSession.sessionId}`);
      const pdfPath = await generateMeetingMinutesPDF(lastSession.lastSummary, lastSession);

      const attachment = new AttachmentBuilder(pdfPath, {
        name: `meeting-minutes-${new Date(lastSession.startTime).toISOString().split('T')[0]}.pdf`,
        description: 'AI-generated meeting minutes'
      });

      await interaction.editReply({
        content: '✅ **Meeting minutes PDF generated!**\n\nDownload your professional meeting minutes below:',
        files: [attachment]
      });

      console.log(`✅ PDF sent to ${interaction.user.tag}`);

    } catch (error) {
      console.error('❌ Error in /minutes:', error);
      await interaction.editReply({
        content: '❌ An error occurred while generating the PDF. Please try again.'
      });
    }
  }
};
