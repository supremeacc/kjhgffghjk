const { EmbedBuilder } = require('discord.js');
const { getInactiveProjects, archiveProject, updateProject } = require('./projectManager');
const { createInactivityWarningEmbed } = require('./projectEmbeds');

const INACTIVITY_WARNING_DAYS = 15;
const ARCHIVE_GRACE_PERIOD_DAYS = 3;

async function checkInactiveProjects(client) {
  try {
    const inactiveProjects = getInactiveProjects(INACTIVITY_WARNING_DAYS);
    
    if (inactiveProjects.length === 0) {
      console.log('✅ No inactive projects found');
      return;
    }

    console.log(`⚠️  Found ${inactiveProjects.length} inactive projects`);

    for (const project of inactiveProjects) {
      const daysSinceActivity = Math.floor((Date.now() - project.lastActivity) / (1000 * 60 * 60 * 24));
      
      if (project.warningTimestamp) {
        const daysSinceWarning = Math.floor((Date.now() - project.warningTimestamp) / (1000 * 60 * 60 * 24));
        
        if (daysSinceWarning >= ARCHIVE_GRACE_PERIOD_DAYS) {
          await archiveProjectSpace(client, project);
        }
      } else {
        await sendInactivityWarning(client, project, daysSinceActivity);
      }
    }
  } catch (error) {
    console.error('❌ Error checking inactive projects:', error);
  }
}

async function sendInactivityWarning(client, project, daysInactive) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const owner = await guild.members.fetch(project.ownerId);
    const chatChannel = await guild.channels.fetch(project.channelIds.chat);
    
    const warningEmbed = createInactivityWarningEmbed(project.name, daysInactive);

    await chatChannel.send({
      content: `<@${project.ownerId}>`,
      embeds: [warningEmbed]
    });

    try {
      await owner.send({
        embeds: [warningEmbed]
      });
    } catch (err) {
      console.log(`⚠️  Could not DM ${owner.user.tag} about inactivity`);
    }

    updateProject(project.id, {
      warningTimestamp: Date.now()
    });

    console.log(`⚠️  Sent inactivity warning for project ${project.name}`);
  } catch (error) {
    console.error(`❌ Error sending warning for project ${project.name}:`, error);
  }
}

async function archiveProjectSpace(client, project) {
  try {
    const guildId = process.env.GUILD_ID;
    let guild;
    
    if (guildId) {
      guild = client.guilds.cache.get(guildId);
    } else {
      guild = client.guilds.cache.first();
    }
    
    if (!guild) {
      console.error('❌ No guild found for archiving project');
      return;
    }

    let archiveCategory = guild.channels.cache.find(
      c => c.name === '📦｜Archived Projects' && c.type === 4
    );

    if (!archiveCategory) {
      try {
        archiveCategory = await guild.channels.create({
          name: '📦｜Archived Projects',
          type: 4
        });
      } catch (err) {
        console.error('❌ Could not create archive category:', err);
        return;
      }
    }

    let category = null;
    let chatChannel = null;
    let voiceChannel = null;

    try {
      category = await guild.channels.fetch(project.categoryId);
    } catch (err) {
      console.log(`⚠️  Category ${project.categoryId} not found, may have been deleted`);
    }

    try {
      chatChannel = await guild.channels.fetch(project.channelIds.chat);
    } catch (err) {
      console.log(`⚠️  Chat channel ${project.channelIds.chat} not found`);
    }

    try {
      voiceChannel = await guild.channels.fetch(project.channelIds.voice);
    } catch (err) {
      console.log(`⚠️  Voice channel ${project.channelIds.voice} not found`);
    }
    
    if (category) {
      try {
        await category.setParent(archiveCategory.id);
        await category.setName(`[ARCHIVED] ${project.name}`);
        
        const allMembers = [project.ownerId, ...project.teammates];
        for (const memberId of allMembers) {
          try {
            await category.permissionOverwrites.edit(memberId, {
              SendMessages: false,
              Connect: false
            });
          } catch (err) {
            console.log(`⚠️  Could not update permissions for user ${memberId}`);
          }
        }
        
        if (chatChannel) {
          await chatChannel.permissionOverwrites.edit(guild.id, {
            SendMessages: false
          });
        }
        if (voiceChannel) {
          await voiceChannel.permissionOverwrites.edit(guild.id, {
            Connect: false
          });
        }
      } catch (err) {
        console.error('❌ Error updating category:', err);
      }
    }

    archiveProject(project.id);
    
    const archiveEmbed = new EmbedBuilder()
      .setTitle('📦 Project Archived')
      .setDescription(`This project has been archived due to inactivity.\n\n` +
        `**Reason:** No activity for over ${INACTIVITY_WARNING_DAYS + ARCHIVE_GRACE_PERIOD_DAYS} days\n\n` +
        `To reactivate your project, contact a moderator.`)
      .setColor(0x95A5A6)
      .setFooter({ text: 'AI Learners India Bot' })
      .setTimestamp();

    if (chatChannel) {
      try {
        await chatChannel.send({ embeds: [archiveEmbed] });
      } catch (err) {
        console.log('⚠️  Could not send archive message to chat channel');
      }
    }

    try {
      const owner = await guild.members.fetch(project.ownerId);
      await owner.send({
        content: `Your project **${project.name}** has been archived due to inactivity.`,
        embeds: [archiveEmbed]
      });
    } catch (err) {
      console.log('⚠️  Could not DM project owner about archival');
    }

    console.log(`📦 Archived project ${project.name}`);
  } catch (error) {
    console.error(`❌ Error archiving project ${project.name}:`, error);
  }
}

function startCleanupScheduler(client) {
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000;
  
  setInterval(() => {
    checkInactiveProjects(client);
  }, CHECK_INTERVAL);

  setTimeout(() => {
    checkInactiveProjects(client);
  }, 60000);

  console.log('🔄 Project cleanup scheduler started');
}

module.exports = {
  startCleanupScheduler,
  checkInactiveProjects
};
