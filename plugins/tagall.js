module.exports = {
  name: "tagall",
  category: "group",
  description: "Mention all group members",

  async execute({ sock, from, msg, args }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants.map(p => p.id);
    const text = args.join(" ") || "Attention everyone!";

    await sock.sendMessage(
      from,
      {
        text:
          `╭──〔 📢 TAG ALL 〕──⬣\n` +
          `┃ Message: ${text}\n` +
          `╰━━━━━━━━━━━━━━⬣\n\n` +
          members.map((id, i) => `${i + 1}. @${id.split("@")[0]}`).join("\n"),
        mentions: members,
      },
      { quoted: msg }
    );
  },
};
