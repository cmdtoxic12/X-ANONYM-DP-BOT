const {
  default: makeWASocket,
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const { checkForUpdates } = require("./lib/updater"); // assuming this exports autoUpdate or similar
const config = require("./config");
const { getText, isOwner } = require("./lib/functions");
const { loadSettings, saveSettings } = require("./lib/settings");

process.on("unhandledRejection", (err) =>
  console.error("Unhandled Rejection:", err),
);
process.on("uncaughtException", (err) =>
  console.error("Uncaught Exception:", err),
);

const AUTH_FOLDER = "auth_info_baileys";
const DP_FOLDER = "./images";

let sock;
let currentDpIndex = 0;
let dpInterval = null;
let updateInterval = null;

const plugins = new Map();

const ownerOnlyCommands = [
  "change",
  "autoread",
  "autotyping",
  "alwaysonline",
  "autostatusview",
  "autostatusreact",
];

function loadPlugins() {
  const pluginFolder = path.join(__dirname, "plugins");
  if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder);

  const files = fs
    .readdirSync(pluginFolder)
    .filter((file) => file.endsWith(".js"));

  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(pluginFolder, file))];
      const plugin = require(path.join(pluginFolder, file));
      if (plugin.name && plugin.execute) {
        plugins.set(plugin.name, plugin);
        console.log(`✅ Loaded plugin: ${plugin.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load plugin ${file}:`, err.message);
    }
  }
}

function watchPlugins() {
  const pluginFolder = path.join(__dirname, "plugins");
  fs.watch(pluginFolder, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;
    console.log(`🔄 Plugin changed: ${filename}, reloading...`);
    plugins.clear();
    loadPlugins();
  });
}

async function getDPFiles() {
  if (!(await fs.pathExists(DP_FOLDER))) {
    await fs.mkdir(DP_FOLDER);
    console.log("✅ Created images folder. Put your DP images there.");
    return [];
  }
  const files = await fs.readdir(DP_FOLDER);
  return files
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
    .map((file) => path.join(DP_FOLDER, file));
}

async function changeProfilePicture() {
  try {
    const dpFiles = await getDPFiles();
    if (dpFiles.length === 0) return;

    const imagePath = dpFiles[currentDpIndex % dpFiles.length];
    currentDpIndex++;

    const buffer = await fs.readFile(imagePath);
    const jid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    await sock.updateProfilePicture(jid, buffer);
    console.log(`✅ DP changed: ${path.basename(imagePath)}`);
  } catch (err) {
    console.error("❌ Failed to change DP:", err.message);
  }
}

async function handleSettingCommands(sock, msg, command, args) {
  const from = msg.key.remoteJid;
  const settings = await loadSettings();
  const option = args[0]?.toLowerCase();
  const valid = ["on", "off"];

  const reply = async (text) => {
    await sock.sendMessage(from, { text }, { quoted: msg });
  };

async function handleSettingCommands(sock, msg, command, args) {
  const from = msg.key.remoteJid;
  const settings = await loadSettings();
  const option = args[0]?.toLowerCase();

  const reply = async (text) => {
    await sock.sendMessage(from, { text }, { quoted: msg });
  };

    if (command === "autoread") {
      if (!valid.includes(option)) return reply("Usage: .autoread on/off");
      settings.autoread = option === "on";
      await saveSettings(settings);
      return reply(`✅ Auto Read is now ${settings.autoread ? "ON" : "OFF"}`);
    }

    if (command === "autotyping") {
      if (!valid.includes(option)) return reply("Usage: .autotyping on/off");
      settings.autotyping = option === "on";
      await saveSettings(settings);
      return reply(
        `✅ Auto Typing is now ${settings.autotyping ? "ON" : "OFF"}`,
      );
    }

    if (command === "alwaysonline") {
      if (!valid.includes(option)) return reply("Usage: .alwaysonline on/off");
      settings.alwaysonline = option === "on";
      await saveSettings(settings);

      if (settings.alwaysonline) {
        await sock.sendPresenceUpdate("available").catch(() => {});
      } else {
        await sock.sendPresenceUpdate("unavailable").catch(() => {});
      }

      return reply(
        `✅ Always Online is now ${settings.alwaysonline ? "ON" : "OFF"}`,
      );
    }

    if (command === "autostatusview") {
      if (!valid.includes(option))
        return reply("Usage: .autostatusview on/off");
      settings.autostatusview = option === "on";
      await saveSettings(settings);
      return reply(
        `✅ Auto Status View is now ${settings.autostatusview ? "ON" : "OFF"}`,
      );
    }

    if (command === "autostatusreact") {
      if (!valid.includes(option))
        return reply("Usage: .autostatusreact on/off ❤️");
      settings.autostatusreact = option === "on";

      if (args[1]) settings.statusReactEmoji = args[1];

      await saveSettings(settings);

      return reply(
        `✅ Auto Status React is now ${settings.autostatusreact ? "ON" : "OFF"}\nEmoji: ${settings.statusReactEmoji}`,
      );
    }

    return false;
  }

  async function startBot() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
      const { version } = await fetchLatestBaileysVersion();

      sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        keepAliveIntervalMs: 30000,
        browser: Browsers.macOS("C-LICON BOT"),
      });

      sock.ev.on("creds.update", saveCreds);
      if (!state.creds.registered) {
        setTimeout(async () => {
          try {
            const phoneNumber = String(config.OWNER_NUMBER).replace(/\D/g, "");
            console.log("🔑 Requesting pairing code for:", phoneNumber);

            const code = await sock.requestPairingCode(phoneNumber);
            console.log(`✅ YOUR PAIRING CODE: ${code}`);
          } catch (err) {
            console.log("❌ Pairing failed:", err.message);
          }
        }, 5000);
      }

      sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
          const msg = messages[0];
          if (!msg.message) return;

          const from = msg.key.remoteJid;
          const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
          const sender = msg.key.fromMe
            ? botJid
            : msg.key.participant || msg.key.remoteJid;

          const settings = await loadSettings();

          // Auto features
          if (
            settings.autoread &&
            !msg.key.fromMe &&
            from !== "status@broadcast"
          ) {
            sock.readMessages([msg.key]).catch(() => {});
          }

          if (settings.autotyping && !msg.key.fromMe) {
            await sock.sendPresenceUpdate("composing", from).catch(() => {});
            setTimeout(
              () => sock.sendPresenceUpdate("paused", from).catch(() => {}),
              3000,
            );
          }

          if (from === "status@broadcast") {
            if (settings.autostatusview)
              sock.readMessages([msg.key]).catch(() => {});
            // Auto react is disabled for stability as per original
            return;
          }

          // Plugin before hooks
          for (const plugin of plugins.values()) {
            if (typeof plugin.before === "function") {
              await plugin.before({ sock, from, msg, sender }).catch(() => {});
            }
          }

          const body = getText(msg);
          if (!body.startsWith(config.PREFIX)) return;

          const args = body.slice(config.PREFIX.length).trim().split(/\s+/);
          const command = args.shift().toLowerCase();

          if (
            ownerOnlyCommands.includes(command) &&
            !isOwner(msg, config.OWNER_NUMBER)
          ) {
            return sock.sendMessage(
              from,
              { text: "❌ Owner only command." },
              { quoted: msg },
            );
          }

          const settingResult = await handleSettingCommands(
            sock,
            msg,
            command,
            args,
          );
          if (settingResult !== false) return;

          const plugin = plugins.get(command);
          if (!plugin) {
            return sock.sendMessage(
              from,
              {
                text: `❌ Unknown command. Use ${config.PREFIX}menu`,
              },
              { quoted: msg },
            );
          }

          await plugin.execute({
            sock,
            msg,
            from,
            sender,
            args,
            command,
            changeProfilePicture,
            plugins,
          });
        } catch (err) {
          console.error("Message handler error:", err);
        }
      });

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
          console.log("✅ Bot Connected!");
          console.log(`👤 JID: ${sock.user.id}`);

          const ownerJid = config.OWNER_NUMBER + "@s.whatsapp.net";
          await sock
            .sendMessage(ownerJid, {
              text: `✅ *${config.BOT_NAME}* is now online!\nPrefix: ${config.PREFIX}`,
            })
            .catch(() => {});

          const settings = await loadSettings();
          if (settings.alwaysonline) {
            sock.sendPresenceUpdate("available").catch(() => {});
          }

          // Start DP rotation with small delay
          if (dpInterval) clearInterval(dpInterval);
          setTimeout(() => {
            dpInterval = setInterval(
              changeProfilePicture,
              config.DP_CHANGE_INTERVAL || 600000,
            );
          }, 5000);

          if (updateInterval) clearInterval(updateInterval);
          updateInterval = setInterval(
            () => {
              checkForUpdates(sock, config).catch(console.error);
            },
            10 * 60 * 1000,
          );
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          console.log(`Connection closed. Code: ${statusCode}`);

          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            console.log("🗑️ Deleting bad session...");
            await fs.remove(AUTH_FOLDER).catch(() => {});
          }

          // Cleanup
          if (sock) {
            sock.ev.removeAllListeners();
            sock.ws?.close?.();
          }

          console.log("🔄 Reconnecting in 5s...");
          setTimeout(startBot, 5000);
        }
      });
    } catch (err) {
      console.error("Fatal start error:", err);
      setTimeout(startBot, 5000);
    }
  }

  // Init
  loadPlugins();
  watchPlugins();
  startBot();
}
