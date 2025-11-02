const { SlashCommandBuilder } = require('discord.js');
const { getUserProject, addTeammate, updateProject } = require('../utils/projectManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-teammate')
    .setDescription('Add teammates to your project space')
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('First teammate to add')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user2')
        .setDescription('Second teammate to add (optional)')
        .setRequired(false)
    )
    .addUserOption(option =>
      option.setName('user3')
        .setDescription('Third teammate to add (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const project = getUserProject(interaction.user.id);

    if (!project) {
      await interaction.editReply({
        content: '❌ You don\'t have an active project. Apply for one using the Apply button!'
      });
      return;
    }

    const users = [
      interaction.options.getUser('user1'),
      interaction.options.getUser('user2'),
      interaction.options.getUser('user3')
    ].filter(u => u !== null);

    try {
      const category = await interaction.guild.channels.fetch(project.categoryId);
      const chatChannel = await interaction.guild.channels.fetch(project.channelIds.chat);
      const voiceChannel = await interaction.guild.channels.fetch(project.channelIds.voice);

      const addedUsers = [];
      
      for (const user of users) {
        if (user.id === interaction.user.id) {
          continue;
        }

        if (project.teammates.includes(user.id)) {
          continue;
        }

        await chatChannel.permissionOverwrites.create(user.id, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });

        await voiceChannel.permissionOverwrites.create(user.id, {
          ViewChannel: true,
          Connect: true,
          Speak: true
        });

        addTeammate(project.id, user.id);
        addedUsers.push(user);
      }

      if (addedUsers.length === 0) {
        await interaction.editReply({
          content: '⚠️ No new teammates were added. They may already be in your project.'
        });
        return;
      }

      const welcomeMessage = `🎉 Welcome to the team! ${addedUsers.map(u => `<@${u.id}>`).join(', ')}\n\n` +
        `You've been added to **${project.name}**. Let's build something amazing together! 🚀`;

      await chatChannel.send(welcomeMessage);

      await interaction.editReply({
        content: `✅ Successfully added ${addedUsers.length} teammate(s) to your project!`
      });

      console.log(`✅ Added ${addedUsers.length} teammates to project ${project.name}`);
    } catch (error) {
      console.error('❌ Error adding teammates:', error);
      await interaction.editReply({
        content: '❌ Failed to add teammates. Please try again or contact a moderator.'
      });
    }
  }
};
