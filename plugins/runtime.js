const { runtime } = require("../lib/functions");

module.exports = {
  name: "runtime",
  description: "Show bot uptime",
  async execute({ sock, from, msg }) {
    await sock.sendMessage(
      from,
      {
        text: `⏱️ *RUNTIME*\n\n${runtime(process.uptime())}`
      },
      { quoted: msg }
    );
  }
};