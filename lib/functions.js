const os = require("os");

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function ramUsage() {
  const used = process.memoryUsage().rss / 1024 / 1024;
  const total = os.totalmem() / 1024 / 1024;
  return `${used.toFixed(0)} MB / ${total.toFixed(0)} MB`;
}

function isOwner(msg, ownerNumber) {
  if (msg.key.fromMe) return true;

  const sender = msg.key.participant || msg.key.remoteJid || "";
  const senderNumber = sender.split("@")[0].split(":")[0].replace(/\D/g, "");
  const owner = String(ownerNumber).replace(/\D/g, "");

  return senderNumber === owner;
}
function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  );
}

module.exports = {
  runtime,
  ramUsage,
  getText,
  isOwner
};
