module.exports = {

name:"admins",
aliases:["tagadmins"],
category:"group",
description:"Mention all admins",

async execute({sock,from,msg}){

if(!from.endsWith("@g.us"))
return sock.sendMessage(from,{text:"❌ Group only."},{quoted:msg});

const metadata=await sock.groupMetadata(from);

const admins=metadata.participants.filter(p=>p.admin);

const mentions=admins.map(a=>a.id);

const text=admins.map((a,i)=>`${i+1}. @${a.id.split("@")[0]}`).join("\n");

await sock.sendMessage(from,{
text:`👑 *GROUP ADMINS*\n\n${text}`,
mentions
},{quoted:msg});

}

}
