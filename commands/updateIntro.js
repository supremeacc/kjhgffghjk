const { SlashCommandBuilder } = require('discord.js');
const { validateIntro } = require('../utils/validateIntro');
const { analyzeIntro } = require('../utils/geminiAnalyze');
const { formatAIEnhancedEmbed, formatEmbed } = require('../utils/formatEmbed');
const { getUserProfile, saveUserProfile, deleteUserProfile } = require('../utils/updateProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update_intro')
    .setDescription('Update your introduction and profile (accepts any format)')
    .addStringOption(option =>
      option.setName('intro')
        .setDescription('Your new introduction in any format - AI will extract the details')
        .setRequired(true)
    ),

  async execute(interaction, profileChannelId) {
    await interaction.deferReply({ ephemeral: true });

    const introText = interaction.options.getString('intro');
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const userAvatarUrl = interaction.user.displayAvatarURL();

    console.log(`🔄 /update_intro command from ${username}`);

    const validation = validateIntro(introText);

    if (validation.isOffTopic) {
      await interaction.editReply({
        content: `⚠️ Your message doesn't seem to be an introduction. Please include information about your role, skills, and goals.`
      });
      return;
    }

    if (validation.isTooShort) {
      await interaction.editReply({
        content: `⚠️ Hey ${username}, your intro seems incomplete! Please include your role, skills, and goals for better analysis.`
      });
      return;
    }

    try {
      const profileChannel = await interaction.client.channels.fetch(profileChannelId);
      
      const existingProfile = await getUserProfile(userId);
      if (existingProfile) {
        try {
          const oldMessage = await profileChannel.messages.fetch(existingProfile.messageId);
          await oldMessage.delete();
          console.log(`🗑️ Deleted old profile for ${username}`);
        } catch (err) {
          console.log(`⚠️  Could not delete old profile (may have been manually deleted)`);
        }
      }

      console.log('🤖 Analyzing intro with Gemini AI...');
      const geminiResult = await analyzeIntro(introText);

      if (!geminiResult.success) {
        await interaction.editReply({
          content: '⚠️ Sorry, there was an error analyzing your introduction. Please try again.'
        });
        return;
      }

      console.log('✨ Creating AI-enhanced embed');
      const profileEmbed = formatAIEnhancedEmbed(
        {},
        geminiResult.data,
        username,
        userAvatarUrl,
        userId
      );

      const profileMessage = await profileChannel.send({ 
        embeds: [profileEmbed] 
      });
      await saveUserProfile(userId, profileMessage.id);

      await interaction.editReply({
        content: `✅ Your profile has been updated successfully! Check <#${profileChannelId}>`
      });

      console.log(`✨ Profile updated for ${username} via slash command`);

    } catch (error) {
      console.error('❌ Error updating profile:', error);
      await interaction.editReply({
        content: '❌ Sorry, there was an error updating your profile. Please try again.'
      });
    }
  }
};
