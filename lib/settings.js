const fs = require("fs-extra");

const SETTINGS_FILE = "./settings.json";

const defaultSettings = {
  autoread: false,
  autotyping: false,
  alwaysonline: false,
  autostatusview: false,
  autostatusreact: false,
  statusReactEmoji: "❤️"
};

async function loadSettings() {
  if (!(await fs.pathExists(SETTINGS_FILE))) {
    await fs.writeJson(SETTINGS_FILE, defaultSettings, { spaces: 2 });
  }

  return await fs.readJson(SETTINGS_FILE);
}

async function saveSettings(settings) {
  await fs.writeJson(SETTINGS_FILE, settings, { spaces: 2 });
}

module.exports = {
  loadSettings,
  saveSettings
};