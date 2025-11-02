const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { loadConfig, updateConfig } = require('../utils/configManager');
const { safeReply, safeError, safeDefer } = require('../utils/safeReply');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-bot')
    .setDescription('Configure the bot channels and roles (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const deferred = await safeDefer(interaction, { ephemeral: true });
    if (!deferred) {
      console.error('Failed to defer setup-bot interaction');
      return;
    }

    try {
      const guild = interaction.guild;
      
      const textChannels = guild.channels.cache
        .filter(ch => ch.type === ChannelType.GuildText)
        .map(ch => ({
          label: `#${ch.name}`,
          description: ch.topic ? ch.topic.substring(0, 100) : 'No description',
          value: ch.id
        }))
        .slice(0, 25);

      const roles = guild.roles.cache
        .filter(role => !role.managed && role.name !== '@everyone')
        .map(role => ({
          label: role.name,
          description: `Members: ${role.members.size}`,
          value: role.id
        }))
        .slice(0, 25);

      if (textChannels.length === 0) {
        await safeReply(interaction, '❌ No text channels found in this server!');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#4A90E2')
        .setTitle('🛠️ Bot Setup Wizard')
        .setDescription('Configure the bot by selecting the appropriate channels and roles below.\n\n' +
                       '**Step 1:** Select the **Intro Channel** (where users will introduce themselves)\n' +
                       '**Step 2:** Select the **Profile Channel** (where formatted profiles will be posted)\n' +
                       '**Step 3:** Select the **Moderator Role** (optional)\n' +
                       '**Step 4:** Select the **Verification Channel** (optional, for project applications)')
        .addFields(
          { name: '📝 Current Configuration', value: 'Not yet configured', inline: false }
        )
        .setFooter({ text: 'AI Learners India Bot Setup', iconURL: interaction.client.user.displayAvatarURL() });

      const introChannelSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_intro_channel')
        .setPlaceholder('📝 Select Intro Channel')
        .addOptions(textChannels);

      const profileChannelSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_profile_channel')
        .setPlaceholder('📋 Select Profile Channel')
        .addOptions(textChannels);

      const modRoleSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_mod_role')
        .setPlaceholder('👮 Select Moderator Role (Optional)')
        .addOptions([
          { label: 'Skip this step', description: 'No moderator role needed', value: 'skip' },
          ...roles
        ]);

      const verificationChannelSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_verification_channel')
        .setPlaceholder('✅ Select Verification Channel (Optional)')
        .addOptions([
          { label: 'Skip this step', description: 'No verification channel needed', value: 'skip' },
          ...textChannels
        ]);

      const row1 = new ActionRowBuilder().addComponents(introChannelSelect);
      const row2 = new ActionRowBuilder().addComponents(profileChannelSelect);
      const row3 = new ActionRowBuilder().addComponents(modRoleSelect);
      const row4 = new ActionRowBuilder().addComponents(verificationChannelSelect);

      let setupMessage;
      try {
        setupMessage = await interaction.editReply({
          embeds: [embed],
          components: [row1, row2, row3, row4],
          fetchReply: true
        });
      } catch (error) {
        console.error('Failed to edit reply in setup:', error);
        return;
      }

      const config = loadConfig();
      const setupData = {
        setupBy: interaction.user.id,
        setupTimestamp: Date.now(),
        guildId: guild.id
      };

      const selections = new Set();
      const maxTime = 300000;
      const startTime = Date.now();

      while (Date.now() - startTime < maxTime) {
        try {
          const componentInteraction = await setupMessage.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id && i.customId.startsWith('setup_'),
            time: maxTime - (Date.now() - startTime)
          });

          if (!componentInteraction.isStringSelectMenu()) continue;

          const value = componentInteraction.values[0];
          
          if (componentInteraction.customId === 'setup_intro_channel') {
            setupData.introChannelId = value;
            selections.add('intro');
            await safeReply(componentInteraction, {
              content: `✅ Intro Channel set to <#${value}>`,
              ephemeral: true
            });
          } else if (componentInteraction.customId === 'setup_profile_channel') {
            setupData.profileChannelId = value;
            selections.add('profile');
            await safeReply(componentInteraction, {
              content: `✅ Profile Channel set to <#${value}>`,
              ephemeral: true
            });
          } else if (componentInteraction.customId === 'setup_mod_role') {
            setupData.moderatorRoleId = value === 'skip' ? null : value;
            selections.add('mod');
            const msg = value === 'skip' 
              ? '⏭️ Moderator role skipped' 
              : `✅ Moderator Role set to <@&${value}>`;
            await safeReply(componentInteraction, {
              content: msg,
              ephemeral: true
            });
          } else if (componentInteraction.customId === 'setup_verification_channel') {
            setupData.verificationChannelId = value === 'skip' ? null : value;
            selections.add('verification');
            const msg = value === 'skip' 
              ? '⏭️ Verification channel skipped' 
              : `✅ Verification Channel set to <#${value}>`;
            await safeReply(componentInteraction, {
              content: msg,
              ephemeral: true
            });
          }

          if (setupData.introChannelId && setupData.profileChannelId) {
            setupData.setupComplete = true;
            const savedConfig = updateConfig(setupData);
            
            if (savedConfig) {
              const successEmbed = new EmbedBuilder()
                .setColor('#00FF7F')
                .setTitle('✅ Bot Setup Complete!')
                .setDescription('The bot has been configured successfully!')
                .addFields(
                  { name: '📝 Intro Channel', value: `<#${setupData.introChannelId}>`, inline: true },
                  { name: '📋 Profile Channel', value: `<#${setupData.profileChannelId}>`, inline: true },
                  { 
                    name: '👮 Moderator Role', 
                    value: setupData.moderatorRoleId ? `<@&${setupData.moderatorRoleId}>` : 'Not set', 
                    inline: true 
                  },
                  { 
                    name: '✅ Verification Channel', 
                    value: setupData.verificationChannelId ? `<#${setupData.verificationChannelId}>` : 'Not set', 
                    inline: true 
                  }
                )
                .setFooter({ text: `Configured by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

              await safeReply(interaction, {
                embeds: [successEmbed],
                ephemeral: true,
                components: []
              });

              console.log(`✅ Bot setup completed by ${interaction.user.tag}`);
              console.log(`Saved config:`, savedConfig);
              break;
            }
          }
        } catch (error) {
          if (error.code === 'INTERACTION_COLLECTOR_ERROR' || error.message.includes('time')) {
            await safeReply(interaction, {
              content: '⏱️ Setup wizard timed out. Please run `/setup-bot` again to configure.',
              ephemeral: true
            });
            break;
          } else {
            console.error('❌ Error in setup wizard:', error);
            await safeReply(interaction, {
              content: '❌ An error occurred during setup. Please try again.',
              ephemeral: true
            });
            break;
          }
        }
      }

    } catch (error) {
      console.error('❌ Error in /setup-bot:', error);
      await safeError(interaction, '❌ An error occurred while setting up the bot. Please try again.', error);
    }
  }
};
