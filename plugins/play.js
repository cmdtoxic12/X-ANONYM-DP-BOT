const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  name: "play",
  aliases: ["song", "music"],
  category: "download",
  description: "Search and download a song from YouTube",

  async execute({ sock, from, msg, args }) {
    const searchQuery = args.join(" ").trim();

    if (!searchQuery) {
      return sock.sendMessage(
        from,
        {
          text:
            "🎵 What song do you want to download?\n\n" +
            "Example: `.play faded alan walker`",
        },
        { quoted: msg },
      );
    }

    try {
      await sock.sendMessage(
        from,
        {
          text: `🔍 Searching for *${searchQuery}*...`,
        },
        { quoted: msg },
      );

      const searchResult = await yts(searchQuery);
      const video = searchResult.videos?.[0];

      if (!video) {
        return sock.sendMessage(
          from,
          { text: "❌ No songs found." },
          { quoted: msg },
        );
      }

      await sock.sendMessage(
        from,
        {
          image: { url: video.thumbnail },
          caption:
            `🎵 *${video.title}*\n\n` +
            `👤 Channel: ${video.author?.name || "Unknown"}\n` +
            `⏱️ Duration: ${video.timestamp || "Unknown"}\n` +
            `👁️ Views: ${formatNumber(video.views)}\n\n` +
            `📥 Please wait, your download is in progress...`,
        },
        { quoted: msg },
      );

      const apiUrl =
        `https://apis-keith.vercel.app/download/dlmp3?url=` +
        encodeURIComponent(video.url);

      const response = await axios.get(apiUrl, {
        timeout: 120000,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      const data = response.data;

      console.log("PLAY API RESPONSE:", JSON.stringify(data, null, 2));

      const result = data?.result;

      const audioUrl =
        result?.downloadUrl ||
        result?.download_url ||
        result?.url ||
        result?.link;

      const title = result?.title || video.title;

      if (!data?.status || !audioUrl) {
        return sock.sendMessage(
          from,
          {
            text:
              "❌ The song was found, but the API did not return a download link.\n" +
              "Please try again later.",
          },
          { quoted: msg },
        );
      }

      const safeTitle = sanitizeFileName(title);

      await sock.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${safeTitle}.mp3`,
          ptt: false,
        },
        { quoted: msg },
      );

      console.log(`✅ PLAY sent: ${title}`);
    } catch (error) {
      console.error("PLAY ERROR:", error.response?.data || error.message);

      let reason = error.message;

      if (error.code === "ECONNABORTED") {
        reason = "The download API took too long to respond.";
      } else if (error.code === "ENOTFOUND") {
        reason = "The download API is currently unreachable.";
      } else if (error.response?.status) {
        reason = `The download API returned HTTP ${error.response.status}.`;
      }

      await sock.sendMessage(
        from,
        {
          text: "❌ Download failed.\n\n" + `Reason: ${reason}`,
        },
        { quoted: msg },
      );
    }
  },
};

function sanitizeFileName(value) {
  return String(value || "song")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Unknown";
  }

  return number.toLocaleString();
}
