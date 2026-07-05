module.exports = {
  name: "revoke",
  category: "group",
  description: "Reset group invite link",

  async execute({ sock, from, msg }) {

    if (!from.endsWith("@g.us"))
      return sock.sendMessage(from,{text:"❌ Group only."},{quoted:msg});

    try{

      await sock.groupRevokeInvite(from);

      const code = await sock.groupInviteCode(from);

      await sock.sendMessage(from,{
        text:`✅ New Link\n\nhttps://chat.whatsapp.com/${code}`
      },{quoted:msg});

    }catch{

      await sock.sendMessage(from,{
        text:"❌ Failed."
      },{quoted:msg});

    }

  }
}
