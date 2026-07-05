module.exports = {
  name: "vv",
  category: "utility",
  description: "Reveals a View Once message (reply to the view once media with .vv)",
  aliases: ["viewonce", "reveal"],

  async execute({ sock, from, msg }) {
    try {
      // Get the quoted message
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                     msg.message?.contextInfo?.quotedMessage;

      if (!quoted) {
        return await sock.sendMessage(
          from,
          { text: "❌ Please reply to a *View Once* message with `.vv`" },
          { quoted: msg }
        );
      }

      // Import necessary functions (you can move these to top if preferred)
      const { normalizeMessageContent, downloadContentFromMessage } = require('@whiskeysockets/baileys');

      const normalized = normalizeMessageContent(quoted);

      let mediaType = null;
      let mediaMessage = null;

      if (normalized.imageMessage) {
        mediaType = 'image';
        mediaMessage = normalized.imageMessage;
      } else if (normalized.videoMessage) {
        mediaType = 'video';
        mediaMessage = normalized.videoMessage;
      } else {
        return await sock.sendMessage(
          from,
          { text: "❌ This is not a View Once image or video." },
          { quoted: msg }
        );
      }

      // Download the media
      const stream = await downloadContentFromMessage(mediaMessage, mediaType);
      
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Send as normal media
      await sock.sendMessage(
        from,
        {
          [mediaType]: buffer,
          caption: `✅ *View Once Revealed*\n\n` +
                   `Original Caption: ${mediaMessage.caption || 'No caption'}`,
          mimetype: mediaMessage.mimetype
        },
        { quoted: msg }
      );

    } catch (error) {
      console.error("VV Command Error:", error);
      await sock.sendMessage(
        from,
        { text: "❌ Failed to reveal the View Once message. Try again." },
        { quoted: msg }
      );
    }
  }
};
