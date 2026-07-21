const fs = require("fs-extra");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

const IMAGE_FOLDER = "./images";

module.exports = {
  name: "uploadpic",

  category: "owner",

  description: "Upload image to DP folder",

  async execute({ sock, from, msg }) {
    try {
      // Check if message contains image

      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const image = msg.message?.imageMessage || quoted?.imageMessage;

      if (!image) {
        return sock.sendMessage(
          from,
          {
            text: "❌ Reply to an image with:\n.uploadpic",
          },
          {
            quoted: msg,
          },
        );
      }

      // Create folder if missing

      await fs.ensureDir(IMAGE_FOLDER);

      let targetMessage = msg;

      // If replying to an image
      if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        targetMessage = {
          key: {
            remoteJid: from,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          },
          message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
        };
      }

      const buffer = await downloadMediaMessage(
    targetMessage,
    "buffer",
    {},
    {
        logger: console
    }
);

      const filename = `dp-${Date.now()}.jpg`;

      const filePath = path.join(IMAGE_FOLDER, filename);

      await fs.writeFile(filePath, buffer);

      await sock.sendMessage(
        from,
        {
          text: `✅ Image uploaded successfully

📁 Folder:
images/

🖼 File:
${filename}`,
        },
        {
          quoted: msg,
        },
      );
    } catch (error) {
      console.log("UPLOAD ERROR:", error);

      await sock.sendMessage(
        from,
        {
          text: "❌ Failed uploading image\n" + error.message,
        },
        {
          quoted: msg,
        },
      );
    }
  },
};
