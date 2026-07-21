const axios = require("axios");

const DATABASE = "https://your-site.com/plugins.json";

module.exports = {
  name: "searchplugin",

  async execute({ sock, from, msg, args }) {
    const query = args.join(" ").toLowerCase();

    if (!query)
      return sock.sendMessage(
        from,
        {
          text: "Example:\n.searchplugin weather",
        },
        { quoted: msg },
      );

    try {
      const { data } = await axios.get(DATABASE);

      const results = data.plugins.filter(
        (p) =>
          p.name.includes(query) || p.description.toLowerCase().includes(query),
      );

      if (!results.length)
        return sock.sendMessage(
          from,
          {
            text: "❌ No plugins found",
          },
          { quoted: msg },
        );

      let text = "🔎 Plugin Results\n\n";

      results.forEach((p, i) => {
        text +=
          `${i + 1}. ${p.name}\n` +
          `📝 ${p.description}\n` +
          `👤 ${p.author}\n` +
          `📌 Version ${p.version}\n\n`;
      });

      await sock.sendMessage(
        from,
        {
          text,
        },
        { quoted: msg },
      );
    } catch (e) {
      console.log(e);
    }
  },
};
