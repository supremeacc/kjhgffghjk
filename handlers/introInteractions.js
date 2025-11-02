const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createIntroModal } = require('../utils/introModal');
const { generateIntroSummary, getExperienceColor, getExperienceEmoji } = require('../utils/aiIntroSummary');
const { getUserProfile, saveUserProfile, deleteUserProfile } = require('../utils/updateProfile');
const { loadConfig } = require('../utils/configManager');
const { safeDefer, safeError } = require('../utils/safeReply');

async function handleIntroButton(interaction) {
  try {
    const modal = createIntroModal();
    await interaction.showModal(modal);
    console.log(`📝 Intro modal shown to ${interaction.user.tag}`);
  } catch (error) {
    console.error('❌ Error showing intro modal:', error);
    await safeError(interaction, '❌ Failed to show introduction form', error);
  }
}

async function handleIntroModal(interaction) {
  const deferred = await safeDefer(interaction, { ephemeral: true });
  if (!deferred) {
    console.error('❌ Failed to defer intro modal interaction');
    return;
  }

  try {
    const name = interaction.fields.getTextInputValue('intro_name') || 'Not provided';
    const role = interaction.fields.getTextInputValue('intro_role') || 'Not provided';
    const institution = interaction.fields.getTextInputValue('intro_institution') || 'Not specified';
    const interests = interaction.fields.getTextInputValue('intro_interests') || 'Not provided';
    const details = interaction.fields.getTextInputValue('intro_details') || 'Not provided';

    const introData = { name, role, institution, interests, details };

    console.log(`📝 Processing introduction from ${interaction.user.tag}`);

    const config = loadConfig();
    const profileChannelId = config.profileChannelId || process.env.PROFILE_CHANNEL_ID;
    
    if (!profileChannelId) {
      await interaction.editReply({
        content: '❌ Profile channel is not configured. Please ask an admin to run `/setup-bot`.'
      });
      return;
    }

    let profileChannel;
    try {
      profileChannel = await interaction.client.channels.fetch(profileChannelId);
    } catch (error) {
      console.error('❌ Failed to fetch profile channel:', error);
      await interaction.editReply({
        content: '❌ Could not find the profile channel. Please contact an admin.'
      });
      return;
    }

    await interaction.editReply({
      content: '⏳ Processing your introduction with AI... This may take a moment.'
    });

    const aiResult = await generateIntroSummary(introData);
    
    let summary, experienceLevel, skills;
    
    if (aiResult.success) {
      summary = aiResult.summary;
      experienceLevel = aiResult.experienceLevel;
      skills = aiResult.skills;
    } else {
      console.warn('⚠️ AI processing failed, using fallback');
      summary = aiResult.fallback.summary;
      experienceLevel = aiResult.fallback.experienceLevel;
      skills = aiResult.fallback.skills;
    }

    const existingProfile = await getUserProfile(interaction.user.id);
    if (existingProfile && existingProfile.messageId) {
      try {
        const oldMessage = await profileChannel.messages.fetch(existingProfile.messageId);
        await oldMessage.delete();
        console.log(`🔄 Deleted old profile for ${interaction.user.tag}`);
      } catch (err) {
        console.warn(`⚠️ Could not delete old profile message:`, err.message);
      }
    }

    const embedColor = getExperienceColor(experienceLevel);
    const levelEmoji = getExperienceEmoji(experienceLevel);

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${levelEmoji} Member Introduction`)
      .setDescription(`<@${interaction.user.id}>\n\n${summary}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '🎓 Name', value: name, inline: true },
        { name: '💼 Role / Study', value: role, inline: true },
        { name: '📊 Experience', value: `${levelEmoji} ${experienceLevel}`, inline: true }
      );

    if (institution && institution !== 'Not specified') {
      embed.addFields({ name: '🏫 Institution', value: institution, inline: true });
    }

    embed.addFields(
      { name: '🤖 Interests', value: interests, inline: false },
      { name: '🧠 Skills', value: skills, inline: false }
    );

    embed.setFooter({ 
      text: 'Verified by AI Learners India Bot 🤖', 
      iconURL: interaction.client.user.displayAvatarURL() 
    });
    embed.setTimestamp();

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`update_intro_${interaction.user.id}`)
          .setLabel('Update Intro')
          .setEmoji('🔁')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`delete_intro_${interaction.user.id}`)
          .setLabel('Delete Intro')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
      );

    let profileMessage;
    try {
      profileMessage = await profileChannel.send({ 
        embeds: [embed],
        components: [buttons]
      });
    } catch (error) {
      console.error('❌ Failed to send profile message:', error);
      await interaction.editReply({
        content: '❌ Failed to post your profile. Please contact an admin.'
      });
      return;
    }

    await saveUserProfile(interaction.user.id, profileMessage.id, {
      introData,
      summary,
      experienceLevel,
      skills
    });

    await interaction.editReply({
      content: `✅ **Your introduction has been posted!**\n\n` +
               `📋 Check it out in ${profileChannel}\n` +
               `${levelEmoji} Experience Level: **${experienceLevel}**\n\n` +
               `You can update or delete your intro anytime using the buttons below it.`
    });

    console.log(`✅ Profile created for ${interaction.user.tag} - ${experienceLevel}`);

  } catch (error) {
    console.error('❌ Error processing intro modal:', error);
    await safeError(interaction, '⚠️ Something went wrong while processing your introduction. Please try again.', error);
  }
}

async function handleUpdateIntroButton(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: '❌ You can only update your own introduction.',
      ephemeral: true
    });
    return;
  }

  try {
    const userProfile = await getUserProfile(userId);
    
    const modal = createIntroModal(userProfile?.introData);
    await interaction.showModal(modal);
    console.log(`📝 Update intro modal shown to ${interaction.user.tag}`);
  } catch (error) {
    console.error('❌ Error showing update modal:', error);
    await safeError(interaction, '❌ Failed to show update form', error);
  }
}

async function handleDeleteIntroButton(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: '❌ You can only delete your own introduction.',
      ephemeral: true
    });
    return;
  }

  const confirmButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_delete_intro_${userId}`)
        .setLabel('Yes, Delete')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancel_delete_intro_${userId}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.reply({
    content: '⚠️ Are you sure you want to delete your introduction? This cannot be undone.',
    components: [confirmButtons],
    ephemeral: true
  });
}

async function handleConfirmDeleteIntro(interaction) {
  const userId = interaction.customId.split('_')[3];
  
  if (interaction.user.id !== userId) {
    await interaction.update({
      content: '❌ You can only delete your own introduction.',
      components: []
    });
    return;
  }

  try {
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.messageId) {
      await interaction.update({
        content: '❌ Could not find your introduction.',
        components: []
      });
      return;
    }

    const config = loadConfig();
    const profileChannelId = config.profileChannelId || process.env.PROFILE_CHANNEL_ID;
    
    try {
      const profileChannel = await interaction.client.channels.fetch(profileChannelId);
      const message = await profileChannel.messages.fetch(userProfile.messageId);
      await message.delete();
      console.log(`🗑️ Deleted intro for ${interaction.user.tag}`);
    } catch (error) {
      console.warn('⚠️ Could not delete message:', error.message);
    }

    await deleteUserProfile(userId);

    await interaction.update({
      content: '✅ Your introduction has been deleted.',
      components: []
    });

  } catch (error) {
    console.error('❌ Error deleting intro:', error);
    await interaction.update({
      content: '❌ Failed to delete your introduction. Please try again.',
      components: []
    });
  }
}

async function handleCancelDeleteIntro(interaction) {
  await interaction.update({
    content: '✅ Deletion cancelled.',
    components: []
  });
}

async function handleEditProfileModal(interaction) {
  await handleIntroModal(interaction);
}

module.exports = {
  handleIntroButton,
  handleIntroModal,
  handleEditProfileModal,
  handleUpdateIntroButton,
  handleDeleteIntroButton,
  handleConfirmDeleteIntro,
  handleCancelDeleteIntro
};
