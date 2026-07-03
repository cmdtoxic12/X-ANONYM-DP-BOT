module.exports = {
  name: "promote",
  category: "group",
  description: "Promote user to admin",

  async execute({ sock, from, msg }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: msg });
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned[0] || quoted;

    if (!target) {
      return sock.sendMessage(from, { text: "Usage: .promote @user or reply .promote" }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(from, [target], "promote");
      await sock.sendMessage(from, {
        text: `✅ Promoted @${target.split("@")[0]} to admin.`,
        mentions: [target],
      });
    } catch (err) {
      await sock.sendMessage(from, { text: "❌ Failed to promote. Make sure bot is admin." }, { quoted: msg });
    }
  },
};
