module.exports = {
  name: "change",
  category: "dp",
  description: "Change profile picture now",
  async execute({ sock, from, msg, changeProfilePicture }) {
    await sock.sendMessage(
      from,
      { text: "🔄 Changing profile picture now..." },
      { quoted: msg }
    );

    await changeProfilePicture();
  }
};
