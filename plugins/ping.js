module.exports = {
  name: "ping",
  description: "Check bot speed",
  async execute({ sock, from, msg }) {
    const start = Date.now();

    const sent = await sock.sendMessage(
      from,
      { text: "🏓 Pinging..." },
      { quoted: msg }
    );

    const speed = Date.now() - start;

    await sock.sendMessage(from, {
      text: `🏓 *PONG!*\n\n⚡ Speed: ${speed}ms\n✅ Bot is online`
    });
  }
};