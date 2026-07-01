const os = require("os");
const config = require("../config");
const { runtime } = require("../lib/functions");

function ramBar() {
  const used = process.memoryUsage().rss;
  const total = os.totalmem();
  const percent = Math.min(Math.round((used / total) * 100), 100);

  const filled = Math.round(percent / 10);
  const empty = 10 - filled;

  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
}

function formatRam() {
  const used = process.memoryUsage().rss / 1024 / 1024;
  const total = os.totalmem() / 1024 / 1024;
  return `${used.toFixed(0)} MB / ${total.toFixed(0)} MB`;
}

module.exports = {
  name: "menu",
  description: "Show stylish command menu",

  async execute({ sock, from, msg, plugins }) {
    const start = Date.now();
    const speed = Date.now() - start;

    const menuText = `
╭━━〔 ◈ ${config.BOT_NAME} ◈ 〕━━⬣
┃ 👑 Owner : ${config.OWNER_NAME}
┃ 🔣 Prefix : [ ${config.PREFIX} ]
┃ 🧩 Plugins : ${plugins.size}
┃ 🔐 Mode : ${config.MODE}
┃ 🧬 Version : ${config.VERSION}
┃ ⚡ Speed : ${speed} ms
┃ ⏱️ Uptime : ${runtime(process.uptime())}
┃ 💾 RAM : ${formatRam()}
┃ 📊 Usage : ${ramBar()}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 📌 MAIN MENU 〕──⬣
┃ ❯❯ ${config.PREFIX}menu
┃ ❯❯ ${config.PREFIX}ping
┃ ❯❯ ${config.PREFIX}alive
┃ ❯❯ ${config.PREFIX}runtime
┃ ❯❯ ${config.PREFIX}owner
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🎮 GAME MENU 〕──⬣
┃ ❯❯ ${config.PREFIX}wcg
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🖼️ DP SYSTEM 〕──⬣
┃ ❯❯ ${config.PREFIX}change
╰━━━━━━━━━━━━━━━━⬣

╭──〔 ⚙️ SETTINGS MENU 〕──⬣
┃ ❯❯ ${config.PREFIX}settings
┃ ❯❯ ${config.PREFIX}autoread on/off
┃ ❯❯ ${config.PREFIX}autotyping on/off
┃ ❯❯ ${config.PREFIX}alwaysonline on/off
┃ ❯❯ ${config.PREFIX}autostatusview on/off
┃ ❯❯ ${config.PREFIX}autostatusreact on/off ❤️
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🔧 INFO 〕──⬣
┃ Host : Panel
┃ Platform : WhatsApp Baileys
┃ Runtime : Node.js
╰━━━━━━━━━━━━━━━━⬣

> Powered by ${config.BOT_NAME}
`;

    await sock.sendMessage(
      from,
      {
        image: { url: "https://files.catbox.moe/m1t25y.png" },
        caption: menuText,
      },
      { quoted: msg }
    );
  },
};
