module.exports = {
  name: "base64",
  category: "utility",
  description: "Encode or decode Base64",

  async execute({ sock, from, msg }) {
    const args = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      ""
    )
      .trim()
      .split(" ");
    const mode = args[1];
    const text = args.slice(2).join(" ");

    if (!mode || !text) {
      return sock.sendMessage(
        from,
        { text: "Usage: `.base64 encode <text>` or `.base64 decode <text>`" },
        { quoted: msg },
      );
    }

    let result;
    if (mode === "encode") {
      result = Buffer.from(text).toString("base64");
    } else if (mode === "decode") {
      result = Buffer.from(text, "base64").toString("utf-8");
    } else {
      return sock.sendMessage(
        from,
        { text: "Mode must be encode or decode" },
        { quoted: msg },
      );
    }

    await sock.sendMessage(
      from,
      { text: `✅ *Result:*\n${result}` },
      { quoted: msg },
    );
  },
};
