const { installPlugin } = require("./manager/installer");

module.exports = {
  name: "install",

  async execute({
 sock,
 from,
 msg,
 args,
 plugins
}) {
    if (!args[0]) {
      return sock.sendMessage(
        from,
        {
          text: "Example:\n.install gistID",
        },
        { quoted: msg },
      );
    }

    try {
      await sock.sendMessage(
        from,
        {
          text: "📥 Installing plugin...",
        },
        { quoted: msg },
      );

      const file = await installPlugin(args[0]);

      await sock.sendMessage(
        from,
        {
          text: `✅ Installed successfully\n\n📦 ${file}\n\nRestart bot to activate`,
        },
        { quoted: msg },
      );
    } catch (e) {
      await sock.sendMessage(
        from,
        {
          text: "❌ Install failed:\n" + e.message,
        },
        { quoted: msg },
      );
    }
  },
};
