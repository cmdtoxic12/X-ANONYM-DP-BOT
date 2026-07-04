module.exports = {
  name: "close",
  category: "group",
  description: "Close group",

  async execute({ sock, from, msg }) {

    if (!from.endsWith("@g.us"))
      return sock.sendMessage(from,{text:"❌ Group only."},{quoted:msg});

    try{

      await sock.groupSettingUpdate(from,"announcement");

      await sock.sendMessage(from,{
        text:"🔒 *Group Closed*\n\nOnly admins can send messages."
      },{quoted:msg});

    }catch{

      await sock.sendMessage(from,{
        text:"❌ Failed. Ensure I'm admin."
      },{quoted:msg});

    }

  }
}
