const {
  resolveVideo,
  downloadVideo,
  removeTemporaryFile,
  sanitizeFileName,
} = require("../lib/youtubeDownloader");

module.exports = {
  name: "ytmp4",
  aliases: ["ytvideo", "video"],
  category: "download",
  description: "Download a YouTube video",

  async execute({ sock, from, msg, args }) {
    const input = args.join(" ").trim();
    let filePath = null;

    if (!input) {
      return sock.sendMessage(
        from,
        {
          text: "Usage: `.ytmp4 <YouTube URL or video title>`",
        },
        { quoted: msg },
      );
    }

    try {
      await sock.sendMessage(
        from,
        { text: "🎬 Preparing video..." },
        { quoted: msg },
      );

      const video = await resolveVideo(input);

      if (video.durationSeconds && video.durationSeconds > 20 * 60) {
        throw new Error("The selected video is longer than 20 minutes.");
      }

      filePath = await downloadVideo(video.url, video.title);

      await sock.sendMessage(
        from,
        {
          video: { url: filePath },
          mimetype: "video/mp4",
          fileName: `${sanitizeFileName(video.title)}.mp4`,
          caption:
            `🎬 *${video.title}*\n\n` +
            `👤 ${video.channel}\n` +
            `⏱️ ${video.duration}`,
        },
        { quoted: msg },
      );
    } catch (error) {
      console.error("YTMP4 ERROR:", error.message);

      await sock.sendMessage(
        from,
        {
          text: `❌ Video download failed.\n\nReason: ${error.message}`,
        },
        { quoted: msg },
      );
    } finally {
      await removeTemporaryFile(filePath);
    }
  },
};
