module.exports = {
  name: "twitter",
  aliases: ["x", "twitterdl"],
  category: "download",
  description: "Download X/Twitter video",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .twitter <tweet url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "🐦 Downloading Twitter/X media..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/twitter?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const media = result?.url || result?.link || result?.video || result?.hd || result?.sd;

      if (!media) {
        return sock.sendMessage(from, { text: "❌ Failed to get Twitter/X media." }, { quoted: msg });
      }

      await sock.sendMessage(
        from,
        {
          video: { url: media },
          caption: "✅ Twitter/X media downloaded"
        },
        { quoted: msg }
      ).catch(async () => {
        await sock.sendMessage(from, { image: { url: media }, caption: "✅ Twitter/X media downloaded" }, { quoted: msg });
      });
    } catch (err) {
      console.log("Twitter Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
