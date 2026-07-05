module.exports = {
  name: "calc",
  category: "utility",
  description: "Simple calculator",

  async execute({ sock, from, msg }) {
    const query = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      ""
    )
      .trim()
      .split(" ")
      .slice(1)
      .join(" ");

    if (!query)
      return sock.sendMessage(
        from,
        { text: "Usage: `.calc 2+2*5`" },
        { quoted: msg },
      );

    try {
      const result = eval(query.replace(/[^0-9+\-*/().]/g, ""));
      await sock.sendMessage(
        from,
        { text: `✅ ${query} = *${result}*` },
        { quoted: msg },
      );
    } catch (e) {
      await sock.sendMessage(
        from,
        { text: "❌ Invalid calculation" },
        { quoted: msg },
      );
    }
  },
};
