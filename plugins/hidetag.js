module.exports = {
  name: "hidetag",
  aliases: ["h"],
  category: "group",
  description: "Send hidden mention to all members",

  async execute({ sock, from, msg, args }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants.map(p => p.id);
    const text = args.join(" ") || "📢 Attention!";

    await sock.sendMessage(
      from,
      {
        text,
        mentions: members,
      },
      { quoted: msg }
    );
  },
};
