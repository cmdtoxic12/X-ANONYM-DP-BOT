const {
  resolveVideo,
  downloadAudio,
  removeTemporaryFile,
  sanitizeFileName,
} = require("../lib/youtubeDownloader");

module.exports = {
  name: "ytmp3",
  aliases: ["ytaudio"],
  category: "download",
  description: "Download YouTube audio as MP3",

  async execute({ sock, from, msg, args }) {
    const input = args.join(" ").trim();
    let filePath = null;

    if (!input) {
      return sock.sendMessage(
        from,
        {
          text: "Usage: `.ytmp3 <YouTube URL or video title>`",
        },
        { quoted: msg },
      );
    }

    try {
      await sock.sendMessage(
        from,
        { text: "🎵 Preparing MP3..." },
        { quoted: msg },
      );

      const video = await resolveVideo(input);

      if (video.durationSeconds && video.durationSeconds > 30 * 60) {
        throw new Error("The selected video is longer than 30 minutes.");
      }

      filePath = await downloadAudio(video.url, video.title);

      await sock.sendMessage(
        from,
        {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
          fileName: `${sanitizeFileName(video.title)}.mp3`,
          ptt: false,
        },
        { quoted: msg },
      );
    } catch (error) {
      console.error("YTMP3 ERROR:", error.message);

      await sock.sendMessage(
        from,
        {
          text: `❌ MP3 download failed.\n\nReason: ${error.message}`,
        },
        { quoted: msg },
      );
    } finally {
      await removeTemporaryFile(filePath);
    }
  },
};
