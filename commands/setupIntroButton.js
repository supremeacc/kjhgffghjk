const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadConfig, isSetupComplete } = require('../utils/configManager');
const { safeReply, safeError, safeDefer } = require('../utils/safeReply');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-intro-button')
    .setDescription('Post the introduction button in the intro channel (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to post the intro button (defaults to configured intro channel)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const deferred = await safeDefer(interaction, { ephemeral: true });
    if (!deferred) {
      console.error('Failed to defer setup-intro-button interaction');
      return;
    }

    try {
      if (!isSetupComplete()) {
        await safeReply(interaction, '❌ Bot is not configured yet! Please run `/setup-bot` first.');
        return;
      }

      const config = loadConfig();
      const targetChannel = interaction.options.getChannel('channel') || 
                           interaction.guild.channels.cache.get(config.introChannelId);

      if (!targetChannel) {
        await safeReply(interaction, '❌ Could not find the target channel. Please specify a channel or run `/setup-bot` again.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#4A90E2')
        .setTitle('🎓 Welcome to AI Learners India!')
        .setDescription(
          '**Hello and welcome to our community!**\n\n' +
          'We\'re excited to have you here. To get started and connect with fellow learners, ' +
          'please introduce yourself by clicking the button below.\n\n' +
          '**What you\'ll share:**\n' +
          '• Your name and background\n' +
          '• Your interests in AI and tech\n' +
          '• Your skills and experience level\n' +
          '• What you want to build or learn\n\n' +
          '**Our AI assistant will:**\n' +
          '✨ Format your introduction professionally\n' +
          '🎯 Assign you the right role based on your experience\n' +
          '🤝 Help you find teammates with similar interests\n\n' +
          '_Your introduction will be posted in the profiles channel for everyone to see!_'
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ 
          text: 'AI Learners India • Powered by Gemini AI', 
          iconURL: interaction.client.user.displayAvatarURL() 
        })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId('intro_button')
        .setLabel('Introduce Yourself')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🪪');

      const row = new ActionRowBuilder().addComponents(button);

      await targetChannel.send({
        embeds: [embed],
        components: [row]
      });

      await safeReply(interaction, `✅ Introduction button posted successfully in ${targetChannel}!`);

      console.log(`✅ Intro button posted in #${targetChannel.name} by ${interaction.user.tag}`);

    } catch (error) {
      console.error('❌ Error in /setup-intro-button:', error);
      await safeError(interaction, '❌ An error occurred while posting the introduction button.', error);
    }
  }
};
