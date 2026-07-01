 const config = require("../config");
const { runtime, ramUsage } = require("../lib/functions");

module.exports = {
  name: "menu",
  description: "Show command menu",

  async execute({ sock, from, msg, plugins }) {
    const start = Date.now();
    const speed = Date.now() - start;

    const menuText = `
╭─◇ *${config.BOT_NAME}* ◇
│ 👑 Owner : ${config.OWNER_NAME}
│ 🔣 Prefix : [ ${config.PREFIX} ]
│ 🧩 Plugins : ${plugins.size}
│ 🔐 Mode : ${config.MODE}
│ 🧬 Version : ${config.VERSION}
│ ⚡ Speed : ${speed} ms
│ ⏱️ Runtime : ${runtime(process.uptime())}
│ 💾 RAM : ${ramUsage()}
╰───────────────◇

╭─◇ *MAIN MENU* ◇
│ ❯❯ ${config.PREFIX}menu
│ ❯❯ ${config.PREFIX}ping
│ ❯❯ ${config.PREFIX}alive
│ ❯❯ ${config.PREFIX}runtime
│ ❯❯ ${config.PREFIX}change
╰───────────────◇

╭─◇ *GAME MENU* ◇
│ ❯❯ ${config.PREFIX}wcg
╰───────────────◇

╭─◇ *SETTINGS MENU* ◇
│ ❯❯ ${config.PREFIX}settings
│ ❯❯ ${config.PREFIX}autoread on/off
│ ❯❯ ${config.PREFIX}autotyping on/off
│ ❯❯ ${config.PREFIX}alwaysonline on/off
│ ❯❯ ${config.PREFIX}autostatusview on/off
│ ❯❯ ${config.PREFIX}autostatusreact on/off ❤️
╰───────────────◇

> Powered by ${config.BOT_NAME}
`;

    await sock.sendMessage(
      from,
      {
        image: { url: "./assets/menu.jpg" },
        caption: menuText,
      },
      { quoted: msg }
    );
  },
};
