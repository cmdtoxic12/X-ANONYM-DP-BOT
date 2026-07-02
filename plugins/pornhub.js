module.exports = {
  name: "pornhub",
  description: "Search Pornhub + Download Links (LolHuman API)",
  aliases: ["ph", "pornh"],

  async execute({ sock, from, msg }) {
    const query = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "")
                  .trim().split(/\s+/).slice(1).join(" ");

    if (!query) {
      return sock.sendMessage(from, { 
        text: "🔍 Usage: `.pornhub your search query`" 
      }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "🔎 Searching Pornhub..." }, { quoted: msg });

    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/pornhub?apikey=FREE&query=${encodeURIComponent(query)}`);
      const json = await res.json();

      if (json.status !== 200 || !json.result?.length) {
        return sock.sendMessage(from, { text: "❌ No results found." }, { quoted: msg });
      }

      const results = json.result.slice(0, 5);

      for (const video of results) {
        const caption = `🔥 *${video.title}*\n` +
                        `Duration: ${video.duration}\n` +
                        `Views: ${video.views}\n` +
                        `Quality: ${video.quality || 'HD'}\n\n` +
                        `📥 *Download:*\n${video.url}`;

        await sock.sendMessage(from, {
          image: { url: video.thumbnail },
          caption: caption
        });
      }

    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "❌ API Error. Try again later." }, { quoted: msg });
    }
  }
};
