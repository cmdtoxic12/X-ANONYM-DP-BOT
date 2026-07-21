const { getRegistry } = require("./manager/registry");

module.exports = {
  name: "plugininfo",

  async execute({ sock, from, msg, args }) {
    const name = args[0];

    const plugin = getRegistry().find((p) => p.name === name);

    if (!plugin)
      return sock.sendMessage(
        from,
        {
          text: "❌ Plugin not found",
        },
        { quoted: msg },
      );

    sock.sendMessage(
      from,
      {
        text: `📦 Plugin Info

Name:
${plugin.name}

Version:
${plugin.version || "Unknown"}

Author:
${plugin.author || "Unknown"}

Gist:
${plugin.gist}`,
      },
      { quoted: msg },
    );
  },
};
