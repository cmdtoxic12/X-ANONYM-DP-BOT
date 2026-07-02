module.exports = {
  name: "rps",
  category: "games",
  description: "Play Rock Paper Scissors with the bot (.rps rock / paper / scissors)",
  aliases: ["rock", "paper", "scissors"],

  async execute({ sock, from, msg }) {
    const args = (msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || "")
                 .trim().toLowerCase().split(" ");

    const userChoice = args[1];
    const choices = ["rock", "paper", "scissors"];
    
    if (!userChoice || !choices.includes(userChoice)) {
      return await sock.sendMessage(from, {
        text: "🎮 *Rock Paper Scissors*\n\nUsage: `.rps rock` / `.rps paper` / `.rps scissors`"
      }, { quoted: msg });
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result;
    if (userChoice === botChoice) {
      result = "🤝 It's a tie!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "🎉 You win!";
    } else {
      result = "😎 Bot wins!";
    }

    await sock.sendMessage(from, {
      text: `🎮 *Rock Paper Scissors*\n\n` +
            `You: ${userChoice.toUpperCase()}\n` +
            `Bot: ${botChoice.toUpperCase()}\n\n` +
            `${result}`
    }, { quoted: msg });
  }
};
