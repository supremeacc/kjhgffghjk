require('dotenv').config();

const sodium = require('libsodium-wrappers');
(async () => {
  await sodium.ready;
  console.log('🔐 Libsodium initialized for voice encoding');
})();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { getUserProfile, saveUserProfile, deleteUserProfile } = require('./utils/updateProfile');
const { loadProjectData, updateLastActivity } = require('./utils/projectManager');
const {
  handleApplyButton,
  handleModalSubmit,
  handleApproveButton,
  handleRejectButton
} = require('./handlers/projectInteractions');
const {
  handleIntroButton,
  handleIntroModal,
  handleEditProfileModal,
  handleUpdateIntroButton,
  handleDeleteIntroButton,
  handleConfirmDeleteIntro,
  handleCancelDeleteIntro
} = require('./handlers/introInteractions');
const { loadConfig, isSetupComplete } = require('./utils/configManager');
const { startCleanupScheduler } = require('./utils/projectCleanup');
const { safeReply, safeError } = require('./utils/safeReply');
const fs = require('fs');
const path = require('path');

process.on('unhandledRejection', (error) => {
  console.error('⚠️ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`📌 Loaded command: ${command.data.name}`);
  }
}

const INTRO_CHANNEL_ID = process.env.INTRO_CHANNEL_ID;
const PROFILE_CHANNEL_ID = process.env.PROFILE_CHANNEL_ID;
const GEMINI_ENABLED = !!process.env.GEMINI_API_KEY;

client.once('clientReady', async () => {
  console.log('✅ Bot is online!');
  console.log(`📝 Logged in as ${client.user.tag}`);
  
  const config = loadConfig();
  const setupComplete = isSetupComplete();
  
  if (setupComplete) {
    console.log('🛠️ Bot Configuration: Complete ✅');
    console.log(`📝 Intro Channel: ${config.introChannelId}`);
    console.log(`📋 Profile Channel: ${config.profileChannelId}`);
    console.log(`👮 Moderator Role: ${config.moderatorRoleId || 'Not set'}`);
  } else {
    console.log('⚠️ Bot Configuration: Incomplete');
    console.log('👉 Run /setup-bot to configure the bot');
  }
  
  console.log(`🤖 Gemini AI: ${GEMINI_ENABLED ? 'Enabled ✅' : 'Disabled ⚠️'}`);
  console.log(`🎙️ Voice Summarizer: Enabled ✅`);
  console.log(`🪪 Modern Intro System: Enabled ✅`);
  
  const commands = [];
  for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || process.env.TOKEN);

  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
  
  startCleanupScheduler(client);
  
  console.log('-----------------------------------');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const projectData = loadProjectData();
  for (const project of Object.values(projectData.projects)) {
    if (project.channelIds.chat === message.channel.id) {
      updateLastActivity(project.id);
      break;
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    try {
      if (interaction.customId === 'intro_button') {
        await handleIntroButton(interaction);
      } else if (interaction.customId.startsWith('update_intro_')) {
        await handleUpdateIntroButton(interaction);
      } else if (interaction.customId.startsWith('delete_intro_')) {
        await handleDeleteIntroButton(interaction);
      } else if (interaction.customId.startsWith('confirm_delete_intro_')) {
        await handleConfirmDeleteIntro(interaction);
      } else if (interaction.customId.startsWith('cancel_delete_intro_')) {
        await handleCancelDeleteIntro(interaction);
      } else if (interaction.customId === 'project_apply') {
        await handleApplyButton(interaction);
      } else if (interaction.customId.startsWith('approve_project_')) {
        await handleApproveButton(interaction);
      } else if (interaction.customId.startsWith('reject_project_')) {
        await handleRejectButton(interaction);
      }
    } catch (error) {
      console.error('❌ Error handling button interaction:', error);
      await safeError(interaction, '❌ There was an error processing your request!', error);
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    try {
      if (interaction.customId === 'intro_modal') {
        await handleIntroModal(interaction);
      } else if (interaction.customId === 'edit_profile_modal') {
        await handleEditProfileModal(interaction);
      } else {
        await handleModalSubmit(interaction);
      }
    } catch (error) {
      console.error('❌ Error handling modal submission:', error);
      await safeError(interaction, '❌ There was an error processing your submission!', error);
    }
    return;
  }
  
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} found.`);
    return;
  }

  try {
    await command.execute(interaction, PROFILE_CHANNEL_ID);
  } catch (error) {
    console.error('❌ Error executing command:', error);
    await safeError(interaction, '❌ There was an error executing this command!', error);
  }
});

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;

if (!token) {
  console.error('❌ ERROR: No Discord token found!');
  console.error('Please add DISCORD_TOKEN or TOKEN to your environment secrets.');
  process.exit(1);
}

if (!INTRO_CHANNEL_ID || !PROFILE_CHANNEL_ID) {
  console.error('❌ ERROR: Channel IDs not configured!');
  console.error('Please add INTRO_CHANNEL_ID and PROFILE_CHANNEL_ID to your environment.');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  process.exit(1);
});
