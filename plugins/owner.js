module.exports = {
  name: "owner",
  description: "Shows owner information",

  async execute({ sock, from, msg }) {
    await sock.sendMessage(
      from,
      {
        text: `👑 *BOT OWNER*

Name: ANONYMOUS 
WhatsApp: wa.me/233535679394`
      },
      { quoted: msg }
    );
  }
};