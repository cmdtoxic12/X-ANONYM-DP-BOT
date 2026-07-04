module.exports = {
  name: "open",
  category: "group",
  description: "Open group for everyone",

  async execute({ sock, from, msg }) {
    if (!from.endsWith("@g.us"))
      return sock.sendMessage(from, { text: "❌ Group only." }, { quoted: msg });

    try {
      await sock.groupSettingUpdate(from, "not_announcement");

      await sock.sendMessage(from, {
        text: "🔓 *Group Opened*\n\nEveryone can now send messages."
      }, { quoted: msg });

    } catch {
      await sock.sendMessage(from, {
        text: "❌ Failed. Ensure I'm an admin."
      }, { quoted: msg });
    }
  }
};
