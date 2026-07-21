const fs = require("fs");

const SUDO_FILE = "./lib/sudo.json";


function getSudo(){

    if(!fs.existsSync(SUDO_FILE)){
        fs.writeFileSync(
            SUDO_FILE,
            JSON.stringify([])
        );
    }

    return JSON.parse(
        fs.readFileSync(SUDO_FILE)
    );

}


function saveSudo(data){

    fs.writeFileSync(
        SUDO_FILE,
        JSON.stringify(data,null,2)
    );

}



module.exports = {

name:"setsudo",


async execute({
    sock,
    from,
    msg,
    args
}){


const number = args[0];


if(!number){

return sock.sendMessage(
from,
{
text:
"Example:\n.setsudo 233XXXXXXXXX"
},
{quoted:msg}
);

}



let sudo = getSudo();


if(!sudo.includes(number))
sudo.push(number);



saveSudo(sudo);



await sock.sendMessage(
from,
{
text:
`✅ Added sudo user\n\n${number}`
},
{quoted:msg}
);


}

};