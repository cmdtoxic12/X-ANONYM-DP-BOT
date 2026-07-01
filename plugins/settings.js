const { loadSettings } = require("../lib/settings");

module.exports = {
  name: "settings",
  async execute({ sock, from, msg }) {
    const s = await loadSettings();

    await sock.sendMessage(
      from,
      {
        text: `⚙️ *BOT SETTINGS*

Auto Read: ${s.autoread ? "ON" : "OFF"}
Auto Typing: ${s.autotyping ? "ON" : "OFF"}
Always Online: ${s.alwaysonline ? "ON" : "OFF"}
Auto Status View: ${s.autostatusview ? "ON" : "OFF"}
Auto Status React: ${s.autostatusreact ? "ON" : "OFF"}
Status Emoji: ${s.statusReactEmoji}`
      },
      { quoted: msg }
    );
  }
};