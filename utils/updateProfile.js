const fs = require('fs').promises;
const path = require('path');

const PROFILES_FILE = path.join(__dirname, '..', 'profiles.json');

async function loadProfiles() {
  try {
    const data = await fs.readFile(PROFILES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveProfiles(profiles) {
  await fs.writeFile(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

async function getUserProfile(userId) {
  const profiles = await loadProfiles();
  return profiles[userId] || null;
}

async function saveUserProfile(userId, messageId, additionalData = {}) {
  const profiles = await loadProfiles();
  profiles[userId] = { 
    messageId, 
    timestamp: Date.now(),
    ...additionalData
  };
  await saveProfiles(profiles);
}

async function deleteUserProfile(userId) {
  const profiles = await loadProfiles();
  delete profiles[userId];
  await saveProfiles(profiles);
}

module.exports = {
  getUserProfile,
  saveUserProfile,
  deleteUserProfile
};
