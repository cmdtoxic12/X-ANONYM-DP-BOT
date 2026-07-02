module.exports = {
  name: "play",
  aliases: ["song", "music"],
  category: "download",
  description: "Search and download music by title",

  async execute({ sock, from, msg, args }) {
    const query = args.join(" ");

    if (!query) {
      return sock.sendMessage(
        from,
        { text: "Usage: .play <song name>\nExample: .play faded alan walker" },
        { quoted: msg }
      );
    }

    await sock.sendMessage(from, { text: "🔍 Searching song..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(query)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const audio =
        result?.download?.url ||
        result?.downloadUrl ||
        result?.url ||
        result?.link ||
        result?.audio;

      if (!audio) {
        return sock.sendMessage(
          from,
          { text: "❌ Could not find audio download link." },
          { quoted: msg }
        );
      }

      const title = result?.title || query;
      const thumbnail = result?.thumbnail || result?.thumb;
      const duration = result?.duration || result?.timestamp || "Unknown";

      if (thumbnail) {
        await sock.sendMessage(
          from,
          {
            image: { url: thumbnail },
            caption:
              `🎵 *${title}*\n\n` +
              `⏱️ Duration: ${duration}\n` +
              `📥 Downloading audio...`,
          },
          { quoted: msg }
        );
      }

      await sock.sendMessage(
        from,
        {
          audio: { url: audio },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("Play Error:", err.message);
      await sock.sendMessage(
        from,
        { text: "❌ Failed to download song. Try another title." },
        { quoted: msg }
      );
    }
  },
};
