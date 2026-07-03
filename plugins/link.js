module.exports = {
  name: "link",
  aliases: ["gclink"],
  category: "group",
  description: "Get group invite link",

  async execute({ sock, from, msg }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: msg });
    }

    try {
      const code = await sock.groupInviteCode(from);
      await sock.sendMessage(
        from,
        { text: `🔗 *Group Link:*\nhttps://chat.whatsapp.com/${code}` },
        { quoted: msg }
      );
    } catch (err) {
      await sock.sendMessage(from, { text: "❌ Failed to get link. Make sure bot is admin." }, { quoted: msg });
    }
  },
};
