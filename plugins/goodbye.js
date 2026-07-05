const { loadSettings, saveSettings } = require("../lib/settings");

module.exports={

name:"goodbye",
category:"group",

async execute({sock,from,msg,args}){

const settings=await loadSettings();

if(!args[0])
return sock.sendMessage(from,{
text:`Usage

.goodbye on
.goodbye off`
},quoted:msg});

settings.goodbye=args[0]=="on";

await saveSettings(settings);

sock.sendMessage(from,{
text:`✅ Goodbye ${settings.goodbye?"Enabled":"Disabled"}`
,{quoted:msg});

}

}
