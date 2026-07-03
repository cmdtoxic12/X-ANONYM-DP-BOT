module.exports = {
  name: "kick",
  category: "group",
  description: "Remove a user from group",

  async execute({ sock, from, msg }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: msg });
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned[0] || quoted;

    if (!target) {
      return sock.sendMessage(from, { text: "Usage: .kick @user or reply .kick" }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(from, [target], "remove");
      await sock.sendMessage(from, {
        text: `✅ Removed @${target.split("@")[0]}`,
        mentions: [target],
      });
    } catch (err) {
      await sock.sendMessage(from, { text: "❌ Failed to kick user. Make sure bot is admin." }, { quoted: msg });
    }
  },
};
