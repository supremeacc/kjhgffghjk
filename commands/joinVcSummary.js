const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { createSession, getActiveSession, addParticipant, addRecording, addTranscript, addRecordingPromise, endSession } = require('../utils/voiceSessionManager');
const { loadProjectData } = require('../utils/projectManager');
const { recordUser } = require('../utils/audioRecorder');
const { transcribeAudio } = require('../utils/geminiTranscribe');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-vc-summary')
    .setDescription('Join your voice channel and start recording for AI meeting summary'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const member = interaction.member;
      const voiceChannel = member.voice.channel;

      if (!voiceChannel) {
        await interaction.editReply({
          content: '❌ You need to be in a voice channel first! Join a voice channel and try again.'
        });
        return;
      }

      const existingSession = getActiveSession(interaction.guildId);
      if (existingSession) {
        await interaction.editReply({
          content: '⚠️ There is already an active recording session in this server! Use `/summarize-vc` to end it first.'
        });
        return;
      }

      if (!voiceChannel.joinable) {
        await interaction.editReply({
          content: '❌ I don\'t have permission to join this voice channel. Please check my role permissions.'
        });
        return;
      }

      if (!voiceChannel.speakable) {
        await interaction.editReply({
          content: '⚠️ I can join but cannot speak. Please grant me "Speak" permission in this voice channel.'
        });
        return;
      }

      const projectData = loadProjectData();
      let projectId = null;
      
      for (const project of Object.values(projectData.projects)) {
        if (project.channelIds.voice === voiceChannel.id) {
          projectId = project.id;
          break;
        }
      }

      console.log(`🎙️ Joining voice channel: ${voiceChannel.name}`);

      let connection;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const existingConnection = getVoiceConnection(voiceChannel.guild.id);
          if (existingConnection) {
            existingConnection.destroy();
            console.log('🔄 Destroyed existing connection before creating new one');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          console.log(`🔌 Connection attempt ${retries + 1}/${maxRetries + 1}...`);
          
          connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
          });

          const timeout = retries === 0 ? 20000 : 25000;
          
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Ready, timeout),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Voice connection timeout after ${timeout}ms`)), timeout)
            )
          ]);
          
          console.log('✅ Voice connection established successfully');
          
          connection.on('stateChange', (oldState, newState) => {
            console.log(`🔊 Voice connection state: ${oldState.status} → ${newState.status}`);
          });
          
          break;
        } catch (error) {
          console.error(`⚠️ Connection attempt ${retries + 1}/${maxRetries + 1} failed:`, error.message);
          console.error('Full error details:', error);
          
          if (connection) {
            try {
              connection.destroy();
            } catch (destroyError) {
              console.error('Error destroying failed connection:', destroyError);
            }
          }
          
          retries++;
          
          if (retries <= maxRetries) {
            const delay = retries === 1 ? 3000 : 5000;
            console.log(`🔄 Retrying in ${delay/1000} seconds with longer timeout...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error('❌ All connection attempts exhausted. Full error:', error);
            await interaction.editReply({
              content: '⚠️ **Failed to connect to the voice channel after multiple attempts.**\n\n' +
                       '**This may be due to:**\n' +
                       '• Slow network connection (common on Replit)\n' +
                       '• Missing bot permissions (Connect, Speak, Use Voice Activity)\n' +
                       '• Discord voice server issues\n\n' +
                       `**Error:** \`${error.message}\`\n\n` +
                       '**What to try:**\n' +
                       '1. Wait a few seconds and try again\n' +
                       '2. Try a different voice channel\n' +
                       '3. Check the bot has proper permissions\n' +
                       '4. Ensure the bot role has "Connect" and "Speak" enabled'
            });
            return;
          }
        }
      }

      const session = createSession(
        interaction.guildId,
        voiceChannel.id,
        interaction.user.id,
        projectId
      );

      voiceChannel.members
        .filter(m => !m.user.bot)
        .forEach(member => {
          addParticipant(interaction.guildId, member.id);
          
          const recordingProcess = recordUser(connection, member.id, interaction.guildId)
            .then(async (audioFile) => {
              console.log(`✅ Recording saved for user ${member.id}: ${audioFile}`);
              addRecording(interaction.guildId, member.id, audioFile);
              
              const transcriptResult = await transcribeAudio(audioFile);
              if (transcriptResult.success) {
                console.log(`✅ Transcription completed for user ${member.id}`);
                addTranscript(interaction.guildId, member.id, transcriptResult.transcript);
              } else {
                console.error(`❌ Transcription failed for user ${member.id}:`, transcriptResult.error);
              }
            })
            .catch(error => {
              console.error(`❌ Recording failed for user ${member.id}:`, error);
            });
          
          addRecordingPromise(interaction.guildId, recordingProcess);
        });

      const participantTags = voiceChannel.members
        .filter(m => !m.user.bot)
        .map(m => `<@${m.id}>`)
        .join(', ');

      const projectInfo = projectId ? '\n🏗️ **Project:** Linked to team workspace' : '';

      await interaction.editReply({
        content: `✅ **Recording Started!**\n\n` +
                 `🎙️ Voice Channel: **${voiceChannel.name}**\n` +
                 `👥 Participants: ${participantTags}${projectInfo}\n\n` +
                 `The bot is now listening and will record your conversation.\n` +
                 `Use \`/summarize-vc\` when you're ready to generate the AI summary!`
      });

      const publicChannel = interaction.channel;
      await publicChannel.send({
        content: `🎙️ **Listening to your VC discussion…**\n\n` +
                 `Voice Channel: **${voiceChannel.name}**\n` +
                 `Initiated by: <@${interaction.user.id}>\n` +
                 `Participants: ${participantTags}\n\n` +
                 `_Recording in progress... Use \`/summarize-vc\` when finished._`
      });

      connection.on(VoiceConnectionStatus.Destroyed, () => {
        const activeSession = getActiveSession(interaction.guildId);
        if (activeSession && activeSession.status === 'recording') {
          endSession(interaction.guildId);
          console.log('🛑 Session cleaned up after connection destroyed');
        }
      });

    } catch (error) {
      console.error('❌ Error in /join-vc-summary:', error);
      await interaction.editReply({
        content: '🛠️ Something went wrong while connecting. Please retry.'
      });
    }
  }
};
