const config = require("../config");
const { runtime } = require("../lib/functions");

module.exports = {
  name: "alive",
  category: "main",
  description: "Show bot alive message",
  async execute({ sock, from, msg }) {
    await sock.sendMessage(
      from,
      {
        text: `🤖 *${config.BOT_NAME}*

✅ Status: Online
👑 Owner: ${config.OWNER_NAME}
⏱️ Uptime: ${runtime(process.uptime())}
🔗 Mode: Pairing Code`
      },
      { quoted: msg }
    );
  }
};
