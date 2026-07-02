module.exports = {
  name: "ytmp3",
  category: "download",
  description: "Download YouTube audio",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .ytmp3 <youtube url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "🎵 Downloading audio..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const audio = result?.download?.url || result?.url || result?.link;

      if (!audio) {
        return sock.sendMessage(from, { text: "❌ Failed to get audio link." }, { quoted: msg });
      }

      await sock.sendMessage(
        from,
        {
          audio: { url: audio },
          mimetype: "audio/mpeg",
          fileName: `${result.title || "audio"}.mp3`
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("YTMP3 Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
