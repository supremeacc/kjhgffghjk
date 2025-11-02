const { SlashCommandBuilder } = require('discord.js');
const { getUserProfile } = require('../utils/updateProfile');
const { createIntroModal } = require('../utils/introModal');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edit-profile')
    .setDescription('Edit your introduction and update your profile'),

  async execute(interaction) {
    try {
      const userProfile = await getUserProfile(interaction.user.id);
      
      let prefillData = {};
      
      if (userProfile && userProfile.introData) {
        prefillData = {
          name: userProfile.introData.name || '',
          role: userProfile.introData.role || '',
          institution: userProfile.introData.institution || '',
          interests: userProfile.introData.interests || '',
          details: userProfile.introData.details || ''
        };
        console.log(`📝 Pre-filling modal for ${interaction.user.tag} with existing data`);
      } else {
        console.log(`📝 No existing profile found for ${interaction.user.tag}, showing empty modal`);
      }

      const modal = createIntroModal(prefillData);
      modal.setCustomId('edit_profile_modal');
      
      await interaction.showModal(modal);

    } catch (error) {
      console.error('❌ Error in /edit-profile:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ An error occurred while opening the edit form. Please try again.',
          ephemeral: true
        });
      }
    }
  }
};
