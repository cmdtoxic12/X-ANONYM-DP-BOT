module.exports={

name:"ginfo",
category:"group",
description:"Group information",

async execute({sock,from,msg}){

if(!from.endsWith("@g.us"))
return sock.sendMessage(from,{text:"❌ Group only."},{quoted:msg});

const g=await sock.groupMetadata(from);

await sock.sendMessage(from,{
text:
`📋 *GROUP INFO*

📛 Name: ${g.subject}

👥 Members: ${g.participants.length}

👑 Owner:
${g.owner||"Unknown"}

📝 Description:
${g.desc||"No description"}

🆔 ID:
${from}`
},{quoted:msg});

}

}
