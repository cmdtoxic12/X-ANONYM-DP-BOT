const crypto = require("crypto");

module.exports = {
  name: "hash",
  category: "utility",
  description: "Generate hash (md5, sha256, etc)",

  async execute({ sock, from, msg }) {
    const args = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      ""
    )
      .trim()
      .split(" ");
    const algo = args[1] || "md5";
    const text = args.slice(2).join(" ");

    if (!text)
      return sock.sendMessage(
        from,
        { text: "Usage: `.hash md5 yourtext`" },
        { quoted: msg },
      );

    const hash = crypto.createHash(algo).update(text).digest("hex");
    await sock.sendMessage(
      from,
      { text: `🔐 *${algo.toUpperCase()} Hash:*\n${hash}` },
      { quoted: msg },
    );
  },
};
