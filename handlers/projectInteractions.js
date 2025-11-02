const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');
const {
  getUserProject,
  createProject,
  updateProject,
  savePendingApplication,
  getPendingApplication,
  deletePendingApplication
} = require('../utils/projectManager');
const {
  createVerificationEmbed,
  createWelcomeEmbed,
  createShowcaseEmbed
} = require('../utils/projectEmbeds');

async function handleApplyButton(interaction) {
  const existingProject = getUserProject(interaction.user.id);
  
  if (existingProject) {
    await interaction.reply({
      content: '⚠️ You already have an active project! Use `/project-status` to view it.',
      ephemeral: true
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId('project_application_modal')
    .setTitle('Project Application');

  const projectNameInput = new TextInputBuilder()
    .setCustomId('project_name')
    .setLabel('🏷️ Project Name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g., AI Content Generator')
    .setRequired(true)
    .setMaxLength(50);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('project_description')
    .setLabel('💡 Short Description')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Briefly describe your project...')
    .setRequired(true)
    .setMaxLength(300);

  const projectTypeInput = new TextInputBuilder()
    .setCustomId('project_type')
    .setLabel('🎯 Project Type')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Startup / AI Research / Automation / Study Group / Other')
    .setRequired(true)
    .setMaxLength(30);

  const teammatesInput = new TextInputBuilder()
    .setCustomId('initial_teammates')
    .setLabel('👥 Initial Teammates (Optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('@user1 @user2 (mention them)')
    .setRequired(false)
    .setMaxLength(100);

  modal.addComponents(
    new ActionRowBuilder().addComponents(projectNameInput),
    new ActionRowBuilder().addComponents(descriptionInput),
    new ActionRowBuilder().addComponents(projectTypeInput),
    new ActionRowBuilder().addComponents(teammatesInput)
  );

  await interaction.showModal(modal);
  console.log(`📝 Showed application modal to ${interaction.user.tag}`);
}

async function handleModalSubmit(interaction) {
  if (interaction.customId !== 'project_application_modal') return;

  await interaction.deferReply({ ephemeral: true });

  const projectName = interaction.fields.getTextInputValue('project_name');
  const description = interaction.fields.getTextInputValue('project_description');
  let projectType = interaction.fields.getTextInputValue('project_type');
  const teammatesInput = interaction.fields.getTextInputValue('initial_teammates');

  const validTypes = ['AI Research', 'Automation', 'Startup', 'Study Group', 'Other'];
  if (!validTypes.some(type => projectType.toLowerCase().includes(type.toLowerCase()))) {
    projectType = 'Other';
  } else {
    projectType = validTypes.find(type => projectType.toLowerCase().includes(type.toLowerCase()));
  }

  const teammateIds = [];
  if (teammatesInput) {
    const mentions = teammatesInput.match(/<@!?(\d+)>/g);
    if (mentions) {
      mentions.forEach(mention => {
        const id = mention.replace(/<@!?(\d+)>/, '$1');
        if (id !== interaction.user.id) {
          teammateIds.push(id);
        }
      });
    }
  }

  const applicationData = {
    projectName,
    description,
    projectType,
    teammates: teammateIds
  };

  savePendingApplication(interaction.user.id, applicationData);

  try {
    const modRoleId = process.env.MOD_ROLE_ID;
    const guild = interaction.guild;

    const verificationChannel = await guild.channels.create({
      name: `verify-${interaction.user.username}-${Date.now().toString().slice(-4)}`,
      type: ChannelType.GuildText,
      parent: null,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        {
          id: interaction.client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
        }
      ]
    });

    if (modRoleId) {
      await verificationChannel.permissionOverwrites.create(modRoleId, {
        ViewChannel: true,
        SendMessages: true,
        ManageMessages: true
      });
    }

    const verificationEmbed = createVerificationEmbed(interaction.user, applicationData);

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_project_${interaction.user.id}`)
          .setLabel('Approve')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`reject_project_${interaction.user.id}`)
          .setLabel('Reject')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );

    await verificationChannel.send({
      content: modRoleId ? `<@&${modRoleId}> New project application for review!` : '@here New project application!',
      embeds: [verificationEmbed],
      components: [buttons]
    });

    await interaction.editReply({
      content: `✅ Application submitted! Please wait in <#${verificationChannel.id}> for moderator review.`
    });

    console.log(`✅ Created verification channel for ${interaction.user.tag}`);
  } catch (error) {
    console.error('❌ Error creating verification channel:', error);
    await interaction.editReply({
      content: '❌ Failed to create verification channel. Please contact a moderator.'
    });
  }
}

async function handleApproveButton(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  const member = interaction.member;
  const modRoleId = process.env.MOD_ROLE_ID;
  
  if (modRoleId && !member.roles.cache.has(modRoleId) && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: '❌ Only moderators can approve applications!',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply();

  const applicationData = getPendingApplication(userId);
  
  if (!applicationData) {
    await interaction.editReply({
      content: '❌ Application data not found. It may have already been processed.'
    });
    return;
  }

  try {
    const guild = interaction.guild;
    const applicant = await guild.members.fetch(userId);

    const categoryName = `🚀｜${applicationData.projectName}`;
    const category = await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: userId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: interaction.client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
        }
      ]
    });

    if (modRoleId) {
      await category.permissionOverwrites.create(modRoleId, {
        ViewChannel: true,
        SendMessages: true
      });
    }

    const chatChannel = await guild.channels.create({
      name: 'team-chat',
      type: ChannelType.GuildText,
      parent: category.id
    });

    const voiceChannel = await guild.channels.create({
      name: 'team-vc',
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    for (const teammateId of applicationData.teammates) {
      try {
        await chatChannel.permissionOverwrites.create(teammateId, {
          ViewChannel: true,
          SendMessages: true
        });
        await voiceChannel.permissionOverwrites.create(teammateId, {
          ViewChannel: true,
          Connect: true,
          Speak: true
        });
      } catch (err) {
        console.log(`⚠️  Could not add permissions for teammate ${teammateId}`);
      }
    }

    const projectId = createProject(userId, {
      name: applicationData.projectName,
      description: applicationData.description,
      type: applicationData.projectType,
      teammates: applicationData.teammates
    });

    updateProject(projectId, {
      categoryId: category.id,
      channelIds: {
        chat: chatChannel.id,
        voice: voiceChannel.id
      }
    });

    const welcomeEmbed = createWelcomeEmbed(
      applicationData.projectName,
      applicationData.projectType,
      userId
    );

    await chatChannel.send({ embeds: [welcomeEmbed] });

    if (applicationData.teammates.length > 0) {
      await chatChannel.send(`👥 Initial team members: ${applicationData.teammates.map(id => `<@${id}>`).join(', ')}`);
    }

    deletePendingApplication(userId);

    await interaction.editReply({
      content: `✅ Project approved! Created workspace at <#${chatChannel.id}>`
    });

    await interaction.channel.delete();

    try {
      await applicant.send(
        `🎉 Your project **${applicationData.projectName}** has been approved!\n\n` +
        `Your private workspace is ready at <#${chatChannel.id}>. Start building! 🚀`
      );
    } catch (err) {
      console.log('⚠️  Could not DM applicant');
    }

    console.log(`✅ Approved project ${applicationData.projectName} for ${applicant.user.tag}`);
  } catch (error) {
    console.error('❌ Error approving project:', error);
    await interaction.editReply({
      content: '❌ Failed to create project workspace. Please try again or contact an admin.'
    });
  }
}

async function handleRejectButton(interaction) {
  const userId = interaction.customId.split('_')[2];
  
  const member = interaction.member;
  const modRoleId = process.env.MOD_ROLE_ID;
  
  if (modRoleId && !member.roles.cache.has(modRoleId) && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await interaction.reply({
      content: '❌ Only moderators can reject applications!',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply();

  const applicationData = getPendingApplication(userId);
  
  if (applicationData) {
    deletePendingApplication(userId);
  }

  try {
    const guild = interaction.guild;
    const applicant = await guild.members.fetch(userId);

    await interaction.editReply({
      content: `❌ Project application rejected by ${interaction.user.tag}.`
    });

    try {
      await applicant.send(
        `❌ Your project application for **${applicationData?.projectName || 'your project'}** was not approved.\n\n` +
        `You can reapply with a revised proposal. Feel free to reach out to moderators if you have questions.`
      );
    } catch (err) {
      console.log('⚠️  Could not DM applicant');
    }

    setTimeout(async () => {
      try {
        await interaction.channel.delete();
      } catch (err) {
        console.log('⚠️  Could not delete verification channel');
      }
    }, 5000);

    console.log(`❌ Rejected project application from ${applicant.user.tag}`);
  } catch (error) {
    console.error('❌ Error rejecting project:', error);
    await interaction.editReply({
      content: '❌ Failed to process rejection. Please contact an admin.'
    });
  }
}

module.exports = {
  handleApplyButton,
  handleModalSubmit,
  handleApproveButton,
  handleRejectButton
};
