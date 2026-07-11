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

function buildCategory(plugins, category, prefix) {
  const list = [];

  for (const plugin of plugins.values()) {
    if (plugin.category === category && plugin.name !== "menu") {
      list.push(`┃ ❯❯ ${prefix}${plugin.name}`);
    }
  }

  return list.length ? list.join("\n") : "┃ No commands yet";
}

module.exports = {
  name: "menu",
  category: "main",
  description: "Show stylish command menu",

  async execute({ sock, from, msg, plugins }) {
    const speed = Date.now() - Date.now();

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
${buildCategory(plugins, "main", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 📥 DOWNLOAD MENU 〕──⬣
${buildCategory(plugins, "download", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🎮 GAME MENU 〕──⬣
${buildCategory(plugins, "games", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 ⚙️ SETTINGS MENU 〕──⬣
${buildCategory(plugins, "settings", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 👥 GROUP MENU 〕──⬣
${buildCategory(plugins, "group", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🖼️ DP SYSTEM 〕──⬣
${buildCategory(plugins, "dp", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🔧 UTILITY MENU 〕──⬣
${buildCategory(plugins, "utility", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

╭──〔 🔧 MEDIA MENU 〕──⬣
${buildCategory(plugins, "media", config.PREFIX)}
╰━━━━━━━━━━━━━━━━⬣

> Powered by ${config.BOT_NAME}
`;

    await sock.sendMessage(
      from,
      {
        image: { url: "https://files.catbox.moe/m1t25y.png" },
        caption: menuText,
      },
      { quoted: msg },
    );
  },
};
