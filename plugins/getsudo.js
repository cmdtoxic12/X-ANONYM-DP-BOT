const fs = require("fs");

module.exports = {
  name: "getsudo",

  async execute({ sock, from, msg }) {
    const sudo = JSON.parse(fs.readFileSync("./lib/sudo.json"));

    await sock.sendMessage(
      from,
      {
        text: `👑 SUDO USERS\n\n${sudo.join("\n")}`,
      },
      { quoted: msg },
    );
  },
};
