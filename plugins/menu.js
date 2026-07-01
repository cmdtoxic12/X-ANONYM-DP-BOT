const config = require("../config");

module.exports = {
  name: "menu",
  description: "Show command menu",
  async execute({ sock, from, msg }) {
    await sock.sendMessage(
      from,
      {
        text: `🤖 *${config.BOT_NAME}*

📌 *MAIN COMMANDS*
.menu
.ping
.alive
.runtime
.change

⚙️ *SETTINGS*
.settings
.autoread on/off
.autotyping on/off
.alwaysonline on/off
.autostatusview on/off
.autostatusreact on/off ❤️

🖼️ *DP SYSTEM*
.change - Change DP now

👑 Owner: ${config.OWNER_NAME}`
      },
      { quoted: msg }
    );
  }
};