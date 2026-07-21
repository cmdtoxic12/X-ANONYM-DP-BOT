const questions = [
  {
    q: "Capital of Ghana?",
    a: "accra",
  },
  {
    q: "2 + 5 × 2 = ?",
    a: "12",
  },
  {
    q: "Largest planet in our solar system?",
    a: "jupiter",
  },
];

module.exports = {
  name: "games",

  commands: ["guess", "quiz", "math", "coinflip", "slot", "trivia"],

  category: "games",

  description: "Fun games",

  async execute({ sock, from, msg, args, command }) {
    const reply = (text) =>
      sock.sendMessage(
        from,
        {
          text,
        },
        {
          quoted: msg,
        },
      );

    // =====================
    // GUESS NUMBER
    // =====================

    if (command === "guess") {
      const number = Math.floor(Math.random() * 10) + 1;

      return reply(
        `🎯 Guess a number between 1-10

My number was:
${number}

(Just for demo)`,
      );
    }

    // =====================
    // QUIZ
    // =====================

    if (command === "quiz" || command === "trivia") {
      const q = questions[Math.floor(Math.random() * questions.length)];

      return reply(
        `🧠 QUIZ TIME

${q.q}

Reply with your answer`,
      );
    }

    // =====================
    // MATH GAME
    // =====================

    if (command === "math") {
      let a = Math.floor(Math.random() * 20);

      let b = Math.floor(Math.random() * 20);

      return reply(
        `🧮 Solve:

${a} + ${b} = ?

Answer me`,
      );
    }

    // =====================
    // COIN FLIP
    // =====================

    if (command === "coinflip") {
      const result = Math.random() > 0.5 ? "HEAD 🪙" : "TAIL 🪙";

      return reply(
        `🪙 Coin Result:

${result}`,
      );
    }

    // =====================
    // SLOT MACHINE
    // =====================

    if (command === "slot") {
      const items = ["🍒", "🍋", "⭐", "💎", "7️⃣"];

      let a = items[Math.floor(Math.random() * items.length)];

      let b = items[Math.floor(Math.random() * items.length)];

      let c = items[Math.floor(Math.random() * items.length)];

      let result = a + b + c;

      let text = `🎰 SLOT MACHINE

${result}
`;

      if (a === b && b === c) text += "\n🎉 JACKPOT!";
      else text += "\n😢 Try again";

      return reply(text);
    }
  },
};
