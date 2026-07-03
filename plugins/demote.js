module.exports = {
  name: "demote",
  category: "group",
  description: "Demote admin to member",

  async execute({ sock, from, msg }) {
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: msg });
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned[0] || quoted;

    if (!target) {
      return sock.sendMessage(from, { text: "Usage: .demote @user or reply .demote" }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(from, [target], "demote");
      await sock.sendMessage(from, {
        text: `✅ Demoted @${target.split("@")[0]}.`,
        mentions: [target],
      });
    } catch (err) {
      await sock.sendMessage(from, { text: "❌ Failed to demote. Make sure bot is admin." }, { quoted: msg });
    }
  },
};
