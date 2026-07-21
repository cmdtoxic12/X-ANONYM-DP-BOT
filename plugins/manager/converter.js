const fs = require("fs");

function convertLegacy(code) {
  const patternMatch = code.match(/pattern:\s*['"`](.*?)['"`]/);

  if (!patternMatch) throw new Error("Cannot detect command name");

  const command = patternMatch[1].replace(" ?(.*)", "").trim();

  const converted = `

module.exports = {

name:"${command}",

category:"converted",

description:"Converted legacy plugin",


async execute({
sock,
from,
msg,
args
}){


const message = {

send: async(text)=>{

return sock.sendMessage(
from,
{
text
},
{
quoted:msg
}
);

},

data:msg,

id:msg.key.id,

reply_message:{},

mention:[]

};



const match =
args.join(" ");



try {

${extractHandler(code)}

}
catch(e){

await message.send(
"❌ Plugin Error: "+e.message
);

}


}

};

`;

  return converted;
}

function extractHandler(code) {
  const start = code.indexOf("async (message");

  if (start === -1) return "";

  let body = code.slice(start);

  body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));

  return body;
}

module.exports = {
  convertLegacy,
};
