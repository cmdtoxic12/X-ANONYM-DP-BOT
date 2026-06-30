const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  generateProfilePicture
} = require("baileys");

const P = require("pino");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const IMAGE_FOLDER = "./images";

// Change this schedule:
// "0 */6 * * *" = every 6 hours
// "0 8 * * *" = every day at 8:00 AM
const DP_SCHEDULE = "0 */6 * * *";

function getRandomImage() {
  const files = fs.readdirSync(IMAGE_FOLDER).filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  if (files.length === 0) {
    throw new Error("No images found in images folder");
  }

  const randomFile = files[Math.floor(Math.random() * files.length)];
  return path.join(IMAGE_FOLDER, randomFile);
}

async function changeDP(sock) {
  const imagePath = getRandomImage();

  const { img } = await generateProfilePicture(
    { url: imagePath },
    { width: 640, height: 640 }
  );

  await sock.updateProfilePicture(sock.user.id, img);

  console.log("DP changed:", imagePath);
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("WhatsApp connected");

      // Auto change on schedule
      cron.schedule(DP_SCHEDULE, async () => {
        try {
          await changeDP(sock);
        } catch (err) {
          console.log("Auto DP error:", err.message);
        }
      });

      console.log("Auto DP scheduler started");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        startBot();
      } else {
        console.log("Logged out. Delete session folder and scan again.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe === false) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text === ".changedp") {
      try {
        await changeDP(sock);
        await sock.sendMessage(msg.key.remoteJid, {
          text: "✅ DP changed successfully."
        });
      } catch (err) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ Failed to change DP: " + err.message
        });
      }
    }
  });
}

startBot();
