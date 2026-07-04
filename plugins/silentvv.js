module.exports = {
  name: "silentvv",
  category: utility,
  description: "Silent View Once reveal - sends media to your own PM (reply or react)",
  aliases: ["svv", "silentviewonce"],

  async execute({ sock, from, msg, sender }) {
    try {
      // Get the quoted message (for reply command)
      let quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                   msg.message?.contextInfo?.quotedMessage;

      // If no quoted message (e.g. reaction case), try to get from message context
      if (!quoted && msg.message?.reactionMessage) {
        // Reactions are trickier - you may need to store recent messages or use msg.key
        // For better reaction support, you might need a message cache in your main bot
        return await sendPrivateMessage(sock, sender, "❌ Please reply with .svv instead of reacting for now.");
      }

      if (!quoted) {
        return await sendPrivateMessage(sock, sender, "❌ Please reply to a View Once message with `.svv`");
      }

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
        return await sendPrivateMessage(sock, sender, "❌ Not a View Once image or video.");
      }

      // Download media
      const stream = await downloadContentFromMessage(mediaMessage, mediaType);
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Send privately to user
      await sock.sendMessage(
        sender, // User's own JID (PM)
        {
          [mediaType]: buffer,
          caption: `✅ *Silent View Once Revealed*\n\nFrom: ${from}\nOriginal Caption: ${mediaMessage.caption || 'None'}`,
          mimetype: mediaMessage.mimetype
        }
      );

      // Optional: Light confirmation in group
      if (from !== sender) {
        await sock.sendMessage(from, { text: "✅ Sent to your PM!" }, { quoted: msg });
      }

    } catch (error) {
      console.error("SilentVV Error:", error);
      await sendPrivateMessage(sock, sender, "❌ Failed to reveal View Once media.");
    }
  }
};

// Helper function to send in PM
async function sendPrivateMessage(sock, jid, text) {
  await sock.sendMessage(jid, { text });
}
