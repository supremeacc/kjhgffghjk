const { EndBehaviorType } = require('@discordjs/voice');
const prism = require('prism-media');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

function recordUser(connection, userId, guildId) {
  return new Promise((resolve, reject) => {
    try {
      const receiver = connection.receiver;

      const audioStream = receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.AfterSilence,
          duration: 500,
        },
      });

      const decoder = new prism.opus.Decoder({
        frameSize: 960,
        channels: 2,
        rate: 48000,
      });

      const pcmFilename = path.join(RECORDINGS_DIR, `${userId}-${Date.now()}.pcm`);
      const writeStream = fs.createWriteStream(pcmFilename);

      audioStream
        .pipe(decoder)
        .pipe(writeStream);

      writeStream.on('finish', async () => {
        console.log(`📼 Recording saved: ${pcmFilename}`);
        try {
          const mp3File = await convertPCMtoMP3(pcmFilename);
          resolve(mp3File);
        } catch (error) {
          reject(error);
        }
      });

      writeStream.on('error', (error) => {
        console.error(`❌ Recording error for user ${userId}:`, error);
        reject(error);
      });

      setTimeout(() => {
        if (!writeStream.closed) {
          audioStream.destroy();
          console.log(`⏱️ Recording timeout for user ${userId} (max duration reached)`);
        }
      }, 300000);

    } catch (error) {
      console.error(`❌ Error setting up recording for ${userId}:`, error);
      reject(error);
    }
  });
}

function convertPCMtoMP3(pcmFile) {
  return new Promise((resolve, reject) => {
    const mp3File = pcmFile.replace('.pcm', '.mp3');
    
    const command = `"${ffmpegPath}" -f s16le -ar 48000 -ac 2 -i "${pcmFile}" -b:a 64k "${mp3File}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ FFmpeg error: ${error.message}`);
        reject(error);
        return;
      }
      
      console.log(`✅ Converted to MP3: ${mp3File}`);
      
      try {
        fs.unlinkSync(pcmFile);
      } catch (err) {
        console.warn(`⚠️ Could not delete PCM file: ${err.message}`);
      }
      
      resolve(mp3File);
    });
  });
}

function cleanupRecordings(olderThanDays = 7) {
  try {
    const files = fs.readdirSync(RECORDINGS_DIR);
    const now = Date.now();
    const maxAge = olderThanDays * 24 * 60 * 60 * 1000;
    
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(RECORDINGS_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old recordings`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up recordings:', error);
  }
}

module.exports = {
  recordUser,
  convertPCMtoMP3,
  cleanupRecordings,
  RECORDINGS_DIR
};
