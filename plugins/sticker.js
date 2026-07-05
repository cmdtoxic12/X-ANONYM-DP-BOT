const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "sticker",
  aliases: ["s"],
  category: "media",
  description: "Convert image/video to sticker",

  async execute({ sock, from, msg }) {
    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const imageMsg =
      msg.message?.imageMessage ||
      quoted?.imageMessage;

    const videoMsg =
      msg.message?.videoMessage ||
      quoted?.videoMessage;

    if (!imageMsg && !videoMsg) {
      return sock.sendMessage(
        from,
        { text: "Usage: Send/reply to an image or short video with .sticker" },
        { quoted: msg }
      );
    }

    try {
      await sock.sendMessage(from, { text: "🧩 Creating sticker..." }, { quoted: msg });

      const type = imageMsg ? "image" : "video";
      const media = imageMsg || videoMsg;

      const stream = await downloadContentFromMessage(media, type);
      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      await sock.sendMessage(
        from,
        {
          sticker: buffer,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("Sticker Error:", err.message);
      await sock.sendMessage(
        from,
        { text: "❌ Failed to create sticker." },
        { quoted: msg }
      );
    }
  },
};
