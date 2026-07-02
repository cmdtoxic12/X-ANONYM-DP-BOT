module.exports = {
  name: "mediafire",
  aliases: ["mf"],
  category: "download",
  description: "Download MediaFire file",

  async execute({ sock, from, msg, args }) {
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, { text: "Usage: .mediafire <mediafire url>" }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "📂 Fetching MediaFire file..." }, { quoted: msg });

    try {
      const api = `https://api.vreden.my.id/api/mediafire?url=${encodeURIComponent(url)}`;
      const res = await fetch(api);
      const json = await res.json();

      const result = json.result || json.data;
      const link = result?.url || result?.link || result?.download;
      const filename = result?.filename || result?.name || "mediafire-file";
      const mime = result?.mime || "application/octet-stream";

      if (!link) {
        return sock.sendMessage(from, { text: "❌ Failed to get MediaFire download link." }, { quoted: msg });
      }

      await sock.sendMessage(
        from,
        {
          document: { url: link },
          fileName: filename,
          mimetype: mime
        },
        { quoted: msg }
      );
    } catch (err) {
      console.log("MediaFire Error:", err.message);
      await sock.sendMessage(from, { text: "❌ Download error." }, { quoted: msg });
    }
  }
};
