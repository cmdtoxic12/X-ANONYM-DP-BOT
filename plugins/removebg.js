const axios = require("axios");
const FormData = require("form-data");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "removebg",
  aliases: ["rmbg"],
  category: "media",
  description: "Remove image background",

  async execute({ sock, from, msg }) {

    const quoted =
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const image =
      msg.message?.imageMessage ||
      quoted?.imageMessage;

    if (!image) {
      return sock.sendMessage(
        from,
        {
          text: "📷 Reply to an image with *.removebg*"
        },
        { quoted: msg }
      );
    }

    try {

      await sock.sendMessage(
        from,
        { text: "🪄 Removing background..." },
        { quoted: msg }
      );

      const stream = await downloadContentFromMessage(image, "image");

      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const form = new FormData();

      form.append("image_file", buffer, "image.jpg");
      form.append("size", "auto");

      const res = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        form,
        {
          headers: {
            ...form.getHeaders(),
            "X-Api-Key": process.env.REMOVE_BG_KEY
          },
          responseType: "arraybuffer"
        }
      );

      await sock.sendMessage(
        from,
        {
          image: Buffer.from(res.data),
          caption: "✅ Background removed."
        },
        { quoted: msg }
      );

    } catch (err) {

      console.log(err.response?.data || err.message);

      sock.sendMessage(
        from,
        {
          text: "❌ Failed to remove background."
        },
        { quoted: msg }
      );

    }

  }
};
