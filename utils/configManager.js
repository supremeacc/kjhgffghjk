const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'botConfig.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading bot config:', error);
  }
  
  return {
    introChannelId: null,
    profileChannelId: null,
    moderatorRoleId: null,
    verificationChannelId: null,
    setupComplete: false,
    setupBy: null,
    setupTimestamp: null
  };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('✅ Bot configuration saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving bot config:', error);
    return false;
  }
}

function updateConfig(updates) {
  const config = loadConfig();
  const updatedConfig = { ...config, ...updates };
  return saveConfig(updatedConfig) ? updatedConfig : null;
}

function resetConfig() {
  const defaultConfig = {
    introChannelId: null,
    profileChannelId: null,
    moderatorRoleId: null,
    verificationChannelId: null,
    setupComplete: false,
    setupBy: null,
    setupTimestamp: null
  };
  return saveConfig(defaultConfig);
}

function isSetupComplete() {
  const config = loadConfig();
  return config.setupComplete && 
         config.introChannelId && 
         config.profileChannelId;
}

module.exports = {
  loadConfig,
  saveConfig,
  updateConfig,
  resetConfig,
  isSetupComplete
};
