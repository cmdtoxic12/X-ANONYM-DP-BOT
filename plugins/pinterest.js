module.exports = {
  name: "pinterest",
  aliases: ["pin"],
  category: "download",
  description: "Search Pinterest images",

  async execute({ sock, from, msg, args }) {
    const query = args.join(" ");

    if (!query) {
      return sock.sendMessage(from, { text: "Usage: .pinterest <search>\nExample: .pinterest cars" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "📌 Searching Pinterest..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(query)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data || [];
      const images = Array.isArray(result) ? result.slice(0, 5) : [];

      if (!images.length) {
        return sock.sendMessage(from, { text: "❌ No Pinterest images found." }, { quoted: msg });
      }

      for (const item of images) {
        const image = typeof item === "string" ? item : item.url || item.image || item.media;

        if (!image) continue;

        await sock.sendMessage(
          from,
          {
            image: { url: image },
            caption: `📌 Pinterest result for: ${query}`
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.log("Pinterest Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Search error." }, { quoted: msg });
    }
  }
};
