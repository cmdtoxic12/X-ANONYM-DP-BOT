module.exports = {
  name: "ytmp4",
  category: "download",
  description: "Download YouTube video",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .ytmp4 <youtube url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "🎬 Downloading video..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const video = result?.download?.url || result?.url || result?.link;

      if (!video) {
        return sock.sendMessage(from, { text: "❌ Failed to get video link." }, { quoted: msg });
      }

      await sock.sendMessage(
        from,
        {
          video: { url: video },
          caption: `🎬 ${result.title || "Downloaded video"}`
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("YTMP4 Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
