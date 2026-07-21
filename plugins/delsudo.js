const fs = require("fs");

module.exports = {
  name: "delsudo",

  async execute({ sock, from, msg, args }) {
    const number = args[0];

    if (!number)
      return sock.sendMessage(
        from,
        {
          text: "Example:\n.delsudo 233XXXXXXXXX",
        },
        { quoted: msg },
      );

    let sudo = JSON.parse(fs.readFileSync("./lib/sudo.json"));

    sudo = sudo.filter((x) => x !== number);

    fs.writeFileSync("./lib/sudo.json", JSON.stringify(sudo, null, 2));

    await sock.sendMessage(
      from,
      {
        text: `❌ Removed sudo:\n${number}`,
      },
      { quoted: msg },
    );
  },
};
