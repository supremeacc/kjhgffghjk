const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserProfile, deleteUserProfile } = require('../utils/updateProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteintro')
    .setDescription('Delete a user\'s profile (Admin only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose profile to delete')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, profileChannelId) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('user');
    const userId = targetUser.id;

    console.log(`🗑️ /deleteintro command for ${targetUser.tag}`);

    try {
      const existingProfile = await getUserProfile(userId);

      if (!existingProfile) {
        await interaction.editReply({
          content: `⚠️ No profile found for ${targetUser.tag}`
        });
        return;
      }

      const profileChannel = await interaction.client.channels.fetch(profileChannelId);
      
      try {
        const message = await profileChannel.messages.fetch(existingProfile.messageId);
        await message.delete();
        console.log(`✅ Deleted profile message for ${targetUser.tag}`);
      } catch (err) {
        console.log(`⚠️  Could not delete profile message (may have been manually deleted)`);
      }

      await deleteUserProfile(userId);

      await interaction.editReply({
        content: `✅ Profile deleted for ${targetUser.tag}`
      });

      console.log(`✨ Profile deleted for ${targetUser.tag}`);

    } catch (error) {
      console.error('❌ Error deleting profile:', error);
      await interaction.editReply({
        content: '❌ Sorry, there was an error deleting the profile. Please try again.'
      });
    }
  }
};
