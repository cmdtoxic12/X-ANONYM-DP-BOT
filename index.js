const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const { checkForUpdates } = require("./lib/updater");
const config = require("./config");
const { getText, isOwner } = require("./lib/functions");
const { loadSettings, saveSettings } = require("./lib/settings");

const AUTH_FOLDER = "auth_info_baileys";
const DP_FOLDER = "./images";

let sock;
let currentDpIndex = 0;
let dpInterval = null;
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

  if (!fs.existsSync(pluginFolder)) {
    fs.mkdirSync(pluginFolder);
  }

  const files = fs
    .readdirSync(pluginFolder)
    .filter((file) => file.endsWith(".js"));

  for (const file of files) {
    delete require.cache[require.resolve(path.join(pluginFolder, file))];

    const plugin = require(path.join(pluginFolder, file));

    if (plugin.name && plugin.execute) {
      plugins.set(plugin.name, plugin);
      console.log(`✅ Loaded plugin: ${plugin.name}`);
    }
  }
}

function watchPlugins() {
  const pluginFolder = path.join(__dirname, "plugins");

  fs.watch(pluginFolder, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    console.log(`🔄 Plugin changed: ${filename}`);
    plugins.clear();
    loadPlugins();
    console.log("✅ Plugins reloaded.");
  });
}

async function getDPFiles() {
  if (!(await fs.pathExists(DP_FOLDER))) {
    await fs.mkdir(DP_FOLDER);
    console.log("✅ Created dps folder. Upload images there.");
    return [];
  }

  const files = await fs.readdir(DP_FOLDER);

  return files
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
    .map((file) => path.join(DP_FOLDER, file));
}

async function changeProfilePicture() {
  try {
    console.log("🔄 changeProfilePicture() called");

    const dpFiles = await getDPFiles();
    console.log("📁 DP files found:", dpFiles);

    if (dpFiles.length === 0) {
      console.log("⚠️ No DP images found in dps folder.");
      return;
    }

    const imagePath = dpFiles[currentDpIndex % dpFiles.length];
    currentDpIndex++;

    console.log("🖼️ Selected image:", imagePath);

    const buffer = await fs.readFile(imagePath);
    console.log("📦 Image buffer size:", buffer.length);

    const jid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    console.log("👤 Updating JID:", jid);

    await sock.updateProfilePicture(jid, buffer);

    console.log(`✅ DP changed successfully: ${path.basename(imagePath)}`);
  } catch (err) {
    console.error("❌ Failed to change DP:", err);
  }
}
async function handleSettingCommands(sock, msg, command, args) {
  const from = msg.key.remoteJid;
  const settings = await loadSettings();
  const option = args[0]?.toLowerCase();

  const valid = ["on", "off"];

  async function reply(text) {
    await sock.sendMessage(from, { text }, { quoted: msg });
  }

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
    return reply(`✅ Auto Typing is now ${settings.autotyping ? "ON" : "OFF"}`);
  }

  if (command === "alwaysonline") {
    if (!valid.includes(option)) return reply("Usage: .alwaysonline on/off");
    settings.alwaysonline = option === "on";
    await saveSettings(settings);

    if (settings.alwaysonline) {
      await sock.sendPresenceUpdate("available");
    } else {
      await sock.sendPresenceUpdate("unavailable");
    }

    return reply(
      `✅ Always Online is now ${settings.alwaysonline ? "ON" : "OFF"}`,
    );
  }

  if (command === "autostatusview") {
    if (!valid.includes(option)) return reply("Usage: .autostatusview on/off");
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

    if (args[1]) {
      settings.statusReactEmoji = args[1];
    }

    await saveSettings(settings);

    return reply(`✅ Auto Status React is now ${settings.autostatusreact ? "ON" : "OFF"}
Emoji: ${settings.statusReactEmoji}`);
  }

  return false;
}

async function startBot() {
  try {
    loadPlugins();
    watchPlugins();

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
      browser: ["C-LICON BOT", "Chrome", "2.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState.creds.registered) {
      if (!config.OWNER_NUMBER || config.OWNER_NUMBER === "233XXXXXXXXX") {
        console.log("❌ Edit OWNER_NUMBER in config.js first.");
        return;
      }

      setTimeout(async () => {
        try {
          console.log("🔑 Requesting pairing code...");
          const code = await sock.requestPairingCode(config.OWNER_NUMBER);
          console.log(`✅ YOUR PAIRING CODE: ${code}`);
        } catch (err) {
          console.error("❌ Pairing code failed:", err.message);
          console.log("🗑️ Delete auth_info_baileys folder and restart.");
        }
      }, 3000);
    }

    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message) return;

      const from = msg.key.remoteJid;
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

      let sender;

      if (msg.key.fromMe) {
        sender = botJid;
      } else {
        sender = msg.key.participant || msg.key.remoteJid;
      }

      const settings = await loadSettings();

      if (settings.autoread) {
        await sock.readMessages([msg.key]);
      }

      if (settings.autotyping && !msg.key.fromMe) {
        await sock.sendPresenceUpdate("composing", from);
        setTimeout(() => {
          sock.sendPresenceUpdate("paused", from).catch(() => {});
        }, 3000);
      }

      if (from === "status@broadcast") {
        if (settings.autostatusview) {
          await sock.readMessages([msg.key]);

          console.log("━━━━━━━━━━━━━━━━━━━━━━");
          console.log("👀 STATUS VIEWED");
          console.log("From:", msg.key.participant || "Unknown");
          console.log("Time:", new Date().toLocaleString());
          console.log("━━━━━━━━━━━━━━━━━━━━━━");
        }

        if (settings.autostatusreact) {
          console.log(
            "⚠️ Auto status react is enabled, but disabled in code for stability.",
          );
        }

        return;
      }

      //if (msg.key.fromMe) return;

      // ✅ This allows games like WCG to read normal messages like "join" or "apple"
      for (const plugin of plugins.values()) {
        if (typeof plugin.before === "function") {
          await plugin.before({
            sock,
            from,
            msg,
            sender,
          });
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
          { text: "❌ This command is owner-only." },
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
            text: `❌ Unknown command: ${config.PREFIX}${command}\nUse ${config.PREFIX}menu`,
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
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        console.log("✅ Successfully connected to WhatsApp!");
        console.log(`👤 JID: ${sock.user.id}`);

        const ownerJid = config.OWNER_NUMBER + "@s.whatsapp.net";

        await sock.sendMessage(ownerJid, {
          text:
            `✅ *${config.BOT_NAME} CONNECTED*\n\n` +
            `🤖 Bot is now online.\n` +
            `🔄 Status: Connected / Restarted\n` +
            `👤 JID: ${sock.user.id}\n` +
            `⏱️ Time: ${new Date().toLocaleString()}\n\n` +
            `Use ${config.PREFIX}menu to view commands.`,
        });

        const settings = await loadSettings();

        if (settings.alwaysonline) {
          await sock.sendPresenceUpdate("available");
        }

        if (dpInterval) clearInterval(dpInterval);

        // await changeProfilePicture();

        dpInterval = setInterval(
          changeProfilePicture,
          config.DP_CHANGE_INTERVAL,
        );
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;

        console.log(`❌ Connection closed. Code: ${statusCode}`);

        if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
          console.log("❌ Logged out or invalid session.");
          console.log("🗑️ Delete auth_info_baileys folder and restart.");
          process.exit(0);
        }

        console.log("🔄 Reconnecting in 5 seconds...");
        if (connection === "close") {
          const shouldReconnect =
            lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut;

          console.log(
            "Connection closed:",
            lastDisconnect?.error?.output?.statusCode,
          );

          if (shouldReconnect) {
            try {
              sock.ev.removeAllListeners();
              sock.ws?.close?.();
            } catch {}

            setTimeout(() => {
              console.log("🔄 Reconnecting...");
              startBot();
            }, 5000);
          } else {
            console.log(
              "❌ Logged out. Delete auth_info_baileys and pair again.",
            );
          }
        }
      }
    });
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    setTimeout(startBot, 5000);
  }
}

startBot();
