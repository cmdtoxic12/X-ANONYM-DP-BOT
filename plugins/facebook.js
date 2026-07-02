module.exports = {
  name: "facebook",
  aliases: ["fb", "fbdl"],
  category: "download",
  description: "Download Facebook video",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .facebook <facebook video url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "📘 Downloading Facebook video..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const video = result?.hd || result?.sd || result?.url || result?.link;

      if (!video) {
        return sock.sendMessage(from, { text: "❌ Failed to get Facebook video." }, { quoted: msg });
      }

      await sock.sendMessage(
        from,
        {
          video: { url: video },
          caption: "✅ Facebook video downloaded"
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("Facebook Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
