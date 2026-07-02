module.exports = {
  name: "tiktok",
  aliases: ["tt"],
  category: "download",
  description: "Download TikTok video",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .tiktok <tiktok url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "🎵 Downloading TikTok..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const video = result?.video || result?.nowm || result?.url || result?.download;

      if (!video) {
        return sock.sendMessage(from, { text: "❌ Failed to get TikTok video." }, { quoted: msg });
      }

      await sock.sendMessage(
        from,
        {
          video: { url: video },
          caption: "✅ TikTok downloaded"
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("TikTok Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
