module.exports = {
  name: "instagram",
  aliases: ["ig"],
  category: "download",
  description: "Download Instagram media",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .instagram <instagram url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "📥 Downloading Instagram media..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/igdl?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const media = Array.isArray(result) ? result : result?.url ? [result] : [];

      if (!media.length) {
        return sock.sendMessage(from, { text: "❌ Failed to get Instagram media." }, { quoted: msg });
      }

      for (const item of media.slice(0, 5)) {
        const link = item.url || item.download_url || item.link;

        if (!link) continue;

        await sock.sendMessage(
          from,
          {
            video: { url: link },
            caption: "✅ Instagram media"
          },
          { quoted: msg }
        ).catch(async () => {
          await sock.sendMessage(from, { image: { url: link }, caption: "✅ Instagram media" }, { quoted: msg });
        });
      }
    } catch (err) {
      console.log("Instagram Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
