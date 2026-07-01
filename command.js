const fs = require("fs-extra");

const SETTINGS_FILE = "./settings.json";

async function loadSettings() {
  if (!(await fs.pathExists(SETTINGS_FILE))) {
    await fs.writeJson(SETTINGS_FILE, {
      autoread: false,
      autotyping: false,
      alwaysonline: false,
      autostatusview: false,
      autostatusreact: false,
      statusReactEmoji: "❤️"
    }, { spaces: 2 });
  }

  return await fs.readJson(SETTINGS_FILE);
}

async function saveSettings(settings) {
  await fs.writeJson(SETTINGS_FILE, settings, { spaces: 2 });
}

async function handleCommands(sock, msg) {
  const from = msg.key.remoteJid;

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  if (!text.startsWith(".")) return;

  const args = text.trim().split(" ");
  const command = args[0].slice(1).toLowerCase();
  const option = args[1]?.toLowerCase();

  const settings = await loadSettings();

  async function reply(message) {
    await sock.sendMessage(from, { text: message }, { quoted: msg });
  }

  if (command === "menu") {
    return reply(`🤖 *AUTO DP BOT MENU*

.menu
.ping
.status
.change

⚙️ *Automation*
.autoread on/off
.autotyping on/off
.alwaysonline on/off
.autostatusview on/off
.autostatusreact on/off ❤️`);
  }

  if (command === "ping") {
    return reply("✅ Bot is alive!");
  }

  if (command === "status") {
    return reply(`📊 *BOT STATUS*

Auto Read: ${settings.autoread ? "ON" : "OFF"}
Auto Typing: ${settings.autotyping ? "ON" : "OFF"}
Always Online: ${settings.alwaysonline ? "ON" : "OFF"}
Auto Status View: ${settings.autostatusview ? "ON" : "OFF"}
Auto Status React: ${settings.autostatusreact ? "ON" : "OFF"}
Status Emoji: ${settings.statusReactEmoji}`);
  }

  if (command === "change") {
    await reply("🔄 Changing DP now...");
    return "change-dp";
  }

  if (command === "autoread") {
    settings.autoread = option === "on";
    await saveSettings(settings);
    return reply(`✅ Auto read is now ${settings.autoread ? "ON" : "OFF"}`);
  }

  if (command === "autotyping") {
    settings.autotyping = option === "on";
    await saveSettings(settings);
    return reply(`✅ Auto typing is now ${settings.autotyping ? "ON" : "OFF"}`);
  }

  if (command === "alwaysonline") {
    settings.alwaysonline = option === "on";
    await saveSettings(settings);
    return reply(`✅ Always online is now ${settings.alwaysonline ? "ON" : "OFF"}`);
  }

  if (command === "autostatusview") {
    settings.autostatusview = option === "on";
    await saveSettings(settings);
    return reply(`✅ Auto status view is now ${settings.autostatusview ? "ON" : "OFF"}`);
  }

  if (command === "autostatusreact") {
    settings.autostatusreact = option === "on";

    if (args[2]) {
      settings.statusReactEmoji = args[2];
    }

    await saveSettings(settings);

    return reply(`✅ Auto status react is now ${settings.autostatusreact ? "ON" : "OFF"}
Emoji: ${settings.statusReactEmoji}`);
  }
}

module.exports = {
  handleCommands,
  loadSettings
};