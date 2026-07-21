const fs = require("fs");
const config = require("../config");

module.exports = {
  name: "owner",

  commands: [
    "owner",
    "setownername",
    "setownernumber",
    "restart",
    "stop",
    "shutdown",
	"mode"
  ],

  category: "settings",

  description: "Owner management commands",

  async execute({ sock, from, msg, args, command }) {
    const reply = (text) =>
      sock.sendMessage(
        from,
        {
          text,
        },
        {
          quoted: msg,
        },
      );

    //
    // OWNER INFO
    //

    if (command === "owner") {
      return reply(
        `👑 *OWNER INFO*

Name:
${config.OWNER_NAME}

Number:
${config.OWNER_NUMBER}

Bot:
${config.BOT_NAME}
`,
      );
    }

    if (command === "mode") {
      const mode = args[0]?.toLowerCase();

      if (!["public", "private"].includes(mode)) {
        return reply(
          `❌ Invalid mode.

Usage:
.mode public
.mode private`,
        );
      }

      const fs = require("fs");

      const file = "./config.js";

      let data = fs.readFileSync(file, "utf8");

      data = data.replace(/MODE:\s*".*?"/, `MODE:"${mode}"`);

      fs.writeFileSync(file, data);

      return reply(
        `✅ Bot mode changed to:

🔐 ${mode.toUpperCase()}

Restart bot to apply.`,
      );
    }

    //
    // CHANGE OWNER NAME
    //

    if (command === "setownername") {
      if (!args[0]) return reply("Example: .setownername Promise");

      const name = args.join(" ");

      let file = "./config.js";

      let data = fs.readFileSync(file, "utf8");

      data = data.replace(/OWNER_NAME:\s*".*?"/, `OWNER_NAME:"${name}"`);

      fs.writeFileSync(file, data);

      return reply(
        `✅ Owner name changed to:
${name}

Restart bot to apply.`,
      );
    }

    //
    // CHANGE OWNER NUMBER
    //

    if (command === "setownernumber") {
      if (!args[0]) return reply("Example: .setownernumber 233xxxxxxxxx");

      const number = args[0].replace(/\D/g, "");

      let file = "./config.js";

      let data = fs.readFileSync(file, "utf8");

      data = data.replace(/OWNER_NUMBER:\s*".*?"/, `OWNER_NUMBER:"${number}"`);

      fs.writeFileSync(file, data);

      return reply(
        `✅ Owner number changed:

${number}

Restart bot.`,
      );
    }

    //
    // RESTART
    //

    if (command === "restart") {
      await reply("🔄 Restarting bot...");

      setTimeout(() => {
        process.exit(0);
      }, 2000);
    }

    //
    // STOP
    //

    if (command === "stop" || command === "shutdown") {
      await reply("🛑 Bot stopped.");

      setTimeout(() => {
        process.exit(0);
      }, 2000);
    }
  },
};
