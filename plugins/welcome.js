const { loadSettings, saveSettings } = require("../lib/settings");

module.exports = {

name:"welcome",
category:"group",

async execute({sock,from,msg,args}){

const settings=await loadSettings();

if(!args[0])
return sock.sendMessage(from,{
text:`Usage

.welcome on
.welcome off`
},{quoted:msg});

settings.welcome=args[0]=="on";

await saveSettings(settings);

sock.sendMessage(from,{
text:`✅ Welcome ${settings.welcome?"Enabled":"Disabled"}`
},{quoted:msg});

}

}
