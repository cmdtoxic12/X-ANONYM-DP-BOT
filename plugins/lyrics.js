module.exports = {
  name: "lyrics",
  aliases: ["lyric"],
  category: "download",
  description: "Search song lyrics",

  async execute({ sock, from, msg, args }) {
    const query = args.join(" ");

    if (!query) {
      return sock.sendMessage(
        from,
        {
          text: "Usage: .lyrics <song name>\nExample: .lyrics faded alan walker",
        },
        { quoted: msg },
      );
    }

    await sock.sendMessage(
      from,
      { text: "🔍 Searching lyrics..." },
      { quoted: msg },
    );

    try {
      const api = `https://api.vreden.my.id/api/lirik?query=${encodeURIComponent(query)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const title = result?.title || query;
      const artist = result?.artist || "Unknown";
      const lyrics = result?.lyrics || result?.lirik || result?.text;

      if (!lyrics) {
        return sock.sendMessage(
          from,
          { text: "❌ Lyrics not found." },
          { quoted: msg },
        );
      }

      const caption =
        `🎶 *LYRICS FOUND*\n\n` +
        `🎵 Title: ${title}\n` +
        `👤 Artist: ${artist}\n\n` +
        `${lyrics.slice(0, 3500)}`;

      await sock.sendMessage(from, { text: caption }, { quoted: msg });
    } catch (err) {
      console.log("Lyrics Error:", err.message);
      await sock.sendMessage(
        from,
        { text: "❌ Failed to fetch lyrics." },
        { quoted: msg },
      );
    }
  },
};
