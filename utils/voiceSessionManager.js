const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '..', 'vcSessions.json');
const PREFERENCES_FILE = path.join(__dirname, '..', 'userPreferences.json');
const activeSessions = new Map();
const languagePreferences = new Map();

function loadSessions() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading VC sessions:', error);
  }
  return { sessions: {} };
}

function saveSessions(data) {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error saving VC sessions:', error);
  }
}

function loadPreferences() {
  try {
    if (fs.existsSync(PREFERENCES_FILE)) {
      const data = fs.readFileSync(PREFERENCES_FILE, 'utf8');
      const prefs = JSON.parse(data);
      Object.entries(prefs).forEach(([userId, pref]) => {
        languagePreferences.set(userId, pref);
      });
    }
  } catch (error) {
    console.error('❌ Error loading preferences:', error);
  }
}

function savePreferences() {
  try {
    const prefs = {};
    languagePreferences.forEach((value, key) => {
      prefs[key] = value;
    });
    fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(prefs, null, 2));
  } catch (error) {
    console.error('❌ Error saving preferences:', error);
  }
}

loadPreferences();

function setLanguagePreference(guildId, userId, mode) {
  languagePreferences.set(userId, mode);
  savePreferences();
  console.log(`📝 Language preference set for ${userId}: ${mode}`);
}

function getLanguagePreference(userId) {
  return languagePreferences.get(userId) || 'auto';
}

const recordingPromises = new Map();

function createSession(guildId, channelId, userId, projectId = null) {
  const sessionId = `${guildId}-${Date.now()}`;
  
  const languageMode = getLanguagePreference(userId);
  
  const session = {
    sessionId,
    guildId,
    channelId,
    initiatorId: userId,
    projectId,
    participants: [userId],
    startTime: Date.now(),
    recordings: {},
    transcripts: [],
    status: 'recording',
    lastSummary: null,
    languageMode
  };
  
  activeSessions.set(guildId, session);
  recordingPromises.set(guildId, []);
  
  const data = loadSessions();
  data.sessions[sessionId] = session;
  saveSessions(data);
  
  console.log(`🎙️ Created VC session: ${sessionId} (language: ${languageMode})`);
  return session;
}

function addRecordingPromise(guildId, promise) {
  const promises = recordingPromises.get(guildId) || [];
  promises.push(promise);
  recordingPromises.set(guildId, promises);
}

async function waitForRecordings(guildId) {
  const promises = recordingPromises.get(guildId) || [];
  console.log(`⏳ Waiting for ${promises.length} recording/transcription processes to complete...`);
  
  try {
    await Promise.allSettled(promises);
    console.log(`✅ All recording/transcription processes completed for guild ${guildId}`);
    recordingPromises.delete(guildId);
  } catch (error) {
    console.error(`❌ Error waiting for recordings:`, error);
  }
}

function getActiveSession(guildId) {
  return activeSessions.get(guildId);
}

function addParticipant(guildId, userId) {
  const session = activeSessions.get(guildId);
  if (session && !session.participants.includes(userId)) {
    session.participants.push(userId);
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
    
    console.log(`➕ Added participant ${userId} to session ${session.sessionId}`);
  }
}

function addRecording(guildId, userId, audioFilePath) {
  const session = activeSessions.get(guildId);
  if (session) {
    if (!session.recordings[userId]) {
      session.recordings[userId] = [];
    }
    session.recordings[userId].push(audioFilePath);
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
  }
}

function addTranscript(guildId, userId, transcript, timestamp) {
  const session = activeSessions.get(guildId);
  if (session) {
    session.transcripts.push({
      userId,
      text: transcript,
      timestamp: timestamp || Date.now()
    });
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
  }
}

function endSession(guildId) {
  const session = activeSessions.get(guildId);
  if (session) {
    session.status = 'ended';
    session.endTime = Date.now();
    
    const data = loadSessions();
    data.sessions[session.sessionId] = session;
    saveSessions(data);
    
    activeSessions.delete(guildId);
    console.log(`🛑 Ended VC session: ${session.sessionId}`);
    return session;
  }
  return null;
}

function saveSummaryToSession(sessionId, summary) {
  const data = loadSessions();
  if (data.sessions[sessionId]) {
    data.sessions[sessionId].lastSummary = summary;
    saveSessions(data);
    console.log(`💾 Summary saved for session ${sessionId}`);
    return true;
  }
  return false;
}

function getLastSession(guildId) {
  const data = loadSessions();
  const sessions = Object.values(data.sessions)
    .filter(s => s.guildId === guildId)
    .sort((a, b) => b.startTime - a.startTime);
  
  return sessions[0] || null;
}

module.exports = {
  createSession,
  getActiveSession,
  addParticipant,
  addRecording,
  addTranscript,
  endSession,
  saveSummaryToSession,
  getLastSession,
  addRecordingPromise,
  waitForRecordings,
  setLanguagePreference,
  getLanguagePreference
};
