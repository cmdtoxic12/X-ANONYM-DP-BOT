const ytSearch = require("yt-search");
const CobaltAPI = require("cobalt-api");

module.exports = {
  name: "play",
  aliases: ["song", "music"],
  category: "download",
  description: "Download YouTube audio",

  async execute({ sock, from, msg, args }) {
    try {
      const query = args.join(" ").trim();

      if (!query) {
        return await sock.sendMessage(
          from,
          {
            text: "🎵 Usage:\n.play <song name>",
          },
          { quoted: msg }
        );
      }

      await sock.sendMessage(
        from,
        { text: "🔍 Searching..." },
        { quoted: msg }
      );

      // Search YouTube
      const search = await ytSearch(query);

      if (!search.videos.length) {
        return sock.sendMessage(
          from,
          { text: "❌ Song not found." },
          { quoted: msg }
        );
      }

      const video = search.videos[0];

      // Cobalt
      const cobalt = new CobaltAPI(video.url);

cobalt.enableAudioOnly();
cobalt.setAFormat("mp3");
cobalt.setFilenamePattern("pretty");

const response = await cobalt.sendRequest();

console.log(
  "COBALT RESPONSE:",
  JSON.stringify(response, null, 2)
);

const status = response?.status;

if (status === "error" || status === "rate-limit") {
  throw new Error(
    response?.text || `Cobalt request failed: ${status}`
  );
}

const audioUrl =
  response?.audio ||
  response?.url ||
  response?.data?.audio ||
  response?.data?.url;

if (!audioUrl) {
  throw new Error(
    `No audio URL returned. Status: ${status || "unknown"}`
  );
}

await sock.sendMessage(
  from,
  {
    audio: { url: audioUrl },
    mimetype: "audio/mpeg",
    fileName: `${sanitizeFileName(video.title)}.mp3`,
    ptt: false,
  },
  { quoted: msg }
);
      await sock.sendMessage(
        from,
        {
          audio: { url: audio },
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error(err);

      await sock.sendMessage(
        from,
        {
          text: `❌ ${err.message}`,
        },
        { quoted: msg }
      );
    }
  },
};