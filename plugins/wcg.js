const wcgGames = new Map();

const JOIN_TIME = 60 * 1000;
const TURN_TIME = 30 * 1000;

module.exports = {
  name: "wcg",
  description: "Multiplayer Word Chain Game",
  aliases: ["wordchain", "chain"],

  async execute({ sock, from, msg, sender, args }) {
    const chatId = from;
    const sub = args[0]?.toLowerCase();
    const game = wcgGames.get(chatId);

    if (sub === "end") {
      if (!game) {
        return reply(sock, from, msg, "❌ No Word Chain game is running.");
      }

      clearTimeout(game.joinTimer);
      clearTimeout(game.turnTimer);
      wcgGames.delete(chatId);

      return reply(sock, from, msg, "🏁 Word Chain game ended.");
    }

    if (game) {
      return reply(sock, from, msg, "⚠️ A Word Chain game is already running.");
    }

    const newGame = {
      owner: sender,
      players: new Map([[sender, { joinedAt: Date.now() }]]),
      phase: "joining",
      currentTurn: null,
      requiredLetter: null,
      requiredLength: null,
      usedWords: new Set(),
      wordsPlayed: 0,
      round: 1,
difficulty: {
  minLength: 3,
  time: 45 * 1000
},
      startedAt: Date.now(),
      joinTimer: null,
      turnTimer: null,
      turnMessageId: null,
    };

    wcgGames.set(chatId, newGame);

    await sock.sendMessage(
      from,
      {
        text:
          `🎮 *WORD CHAIN GAME INITIATED!*\n\n` +
          `👑 Host: @${sender.split("@")[0]}\n` +
          `⏳ Joining closes in *60 seconds*.\n\n` +
          `Type *join* to participate.\n\n` +
          `👥 Players: 1\n` +
          `1. @${sender.split("@")[0]}`,
        mentions: [sender],
      },
      { quoted: msg }
    );

    newGame.joinTimer = setTimeout(() => startGame(sock, chatId), JOIN_TIME);
  },

  async before({ sock, from, msg, sender }) {
    const game = wcgGames.get(from);
    if (!game) return;

    const text = getText(msg).trim().toLowerCase();
    if (!text) return;

    if (text === ".wcg end") {
      clearTimeout(game.joinTimer);
      clearTimeout(game.turnTimer);
      wcgGames.delete(from);
      return reply(sock, from, msg, "🏁 Word Chain game ended.");
    }

    if (game.phase === "joining") {
      if (text === "join") {
        return joinGame(sock, from, msg, sender, game);
      }
      return;
    }

    if (game.phase === "playing") {
  if (text.startsWith(".")) return;
  if (sender !== game.currentTurn) return;

  const quotedId =
    msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

  if (quotedId !== game.turnMessageId) return;

  return handlePlayerWord(sock, from, msg, sender, text, game);
}
  },
};

async function joinGame(sock, from, msg, sender, game) {
  if (game.players.has(sender)) {
    return sock.sendMessage(
      from,
      {
        text: `⚠️ @${sender.split("@")[0]}, you already joined.`,
        mentions: [sender],
      },
      { quoted: msg }
    );
  }

  game.players.set(sender, { joinedAt: Date.now() });

  const players = Array.from(game.players.keys());

  return sock.sendMessage(
    from,
    {
      text:
        `✅ @${sender.split("@")[0]} joined the game!\n\n` +
        `👥 Players: ${players.length}\n` +
        players.map((p, i) => `${i + 1}. @${p.split("@")[0]}`).join("\n"),
      mentions: players,
    },
    { quoted: msg }
  );
}

async function startGame(sock, chatId) {
  const game = wcgGames.get(chatId);
  if (!game || game.phase !== "joining") return;

  if (game.players.size < 2) {
    await sock.sendMessage(chatId, {
      text: "❌ Not enough players joined.\nGame cancelled.",
    });

    wcgGames.delete(chatId);
    return;
  }

  game.phase = "playing";
  game.currentTurn = Array.from(game.players.keys())[0];

  await sock.sendMessage(chatId, {
    text:
      `🎉 *GAME STARTED!*\n\n` +
      `👥 Players:\n` +
      Array.from(game.players.keys())
        .map((p, i) => `${i + 1}. @${p.split("@")[0]}`)
        .join("\n"),
    mentions: Array.from(game.players.keys()),
  });

  sendTurn(sock, chatId);
}

async function handlePlayerWord(sock, from, msg, sender, word, game) {
  const cleanWord = word.replace(/[^a-z]/g, "");

  if (!cleanWord) return;

  if (cleanWord.length < game.requiredLength) {
  return reply(
    sock,
    from,
    msg,
    `❌ Invalid word.\nMinimum required: *${game.requiredLength} letters*`
  );
}

  if (cleanWord[0] !== game.requiredLetter) {
    return reply(sock, from, msg, `❌ Invalid word.\nMust start with: *${game.requiredLetter.toUpperCase()}*`);
  }

  if (game.usedWords.has(cleanWord)) {
    return reply(sock, from, msg, "❌ This word has already been used.");
  }

  clearTimeout(game.turnTimer);

  game.usedWords.add(cleanWord);
  game.wordsPlayed++;

  await sock.sendMessage(
    from,
    { text: `✅ *${cleanWord.toUpperCase()}* accepted!` },
    { quoted: msg }
  );

  nextTurn(sock, from, sender);
}

async function sendTurn(sock, chatId) {
  const game = wcgGames.get(chatId);
  if (!game) return;

  updateDifficulty(game);

  game.requiredLetter = randomLetter();
  game.requiredLength = game.difficulty.minLength;

  clearTimeout(game.turnTimer);

  const players = Array.from(game.players.keys());
  const currentIndex = players.indexOf(game.currentTurn);
  const nextPlayer = players[(currentIndex + 1) % players.length];

  const timeSeconds = Math.floor(game.difficulty.time / 1000);

  const sent = await sock.sendMessage(chatId, {
    text:
      `━━━━━━━━━━━━━━━\n` +
      `🎯 *WORD CHAIN*\n\n` +
      `🏁 Round: *${game.round}*\n` +
      `👤 Turn: @${game.currentTurn.split("@")[0]}\n\n` +
      `📝 Required word:\n` +
      `• Starts with: *${game.requiredLetter.toUpperCase()}*\n` +
      `• Minimum length: *${game.requiredLength} letters*\n\n` +
      `⏳ Time: *${timeSeconds} seconds*\n` +
      `➡️ Next player: @${nextPlayer.split("@")[0]}\n` +
      `━━━━━━━━━━━━━━━`,
    mentions: [game.currentTurn, nextPlayer],
  });

  game.turnMessageId = sent.key.id;

  game.turnTimer = setTimeout(() => eliminatePlayer(sock, chatId), game.difficulty.time);
}

function nextTurn(sock, chatId, previousPlayer) {
  const game = wcgGames.get(chatId);
  if (!game) return;

  const players = Array.from(game.players.keys());
  const index = players.indexOf(previousPlayer);

  game.currentTurn = players[(index + 1) % players.length];

  sendTurn(sock, chatId);
}

async function eliminatePlayer(sock, chatId) {
  const game = wcgGames.get(chatId);
  if (!game) return;

  const failedPlayer = game.currentTurn;
  const playersBefore = Array.from(game.players.keys());
  const failedIndex = playersBefore.indexOf(failedPlayer);

  game.players.delete(failedPlayer);

  await sock.sendMessage(chatId, {
    text:
      `⏰ *Time's up!*\n\n` +
      `❌ @${failedPlayer.split("@")[0]} has been eliminated.\n\n` +
      `👥 Players remaining: ${game.players.size}`,
    mentions: [failedPlayer],
  });

  if (game.players.size <= 1) {
    return endWithWinner(sock, chatId);
  }

  const remaining = Array.from(game.players.keys());
  game.currentTurn = remaining[failedIndex % remaining.length];

  sendTurn(sock, chatId);
}

async function endWithWinner(sock, chatId) {
  const game = wcgGames.get(chatId);
  if (!game) return;

  const winner = Array.from(game.players.keys())[0];
  const duration = formatDuration(Date.now() - game.startedAt);

  clearTimeout(game.joinTimer);
  clearTimeout(game.turnTimer);
  wcgGames.delete(chatId);

  if (!winner) {
    return sock.sendMessage(chatId, {
      text: "🏁 Game over. No winner.",
    });
  }

  return sock.sendMessage(chatId, {
    text:
      `🏆 *GAME OVER!*\n\n` +
      `🥇 Winner: @${winner.split("@")[0]}\n\n` +
      `📝 Words played: ${game.wordsPlayed}\n` +
      `⏱️ Duration: ${duration}\n\n` +
      `Congratulations!`,
    mentions: [winner],
  });
}

function randomLetter() {
  const letters = "aaaabbccddeeeeffgghhiikkllmmnnooppprrrssssttttuuwy";
  return letters[Math.floor(Math.random() * letters.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function updateDifficulty(game) {
  const words = game.wordsPlayed;

  if (words < 5) {
    game.difficulty.minLength = 3;
    game.difficulty.time = 45 * 1000;
    game.round = 1;
  } else if (words < 10) {
    game.difficulty.minLength = 4;
    game.difficulty.time = 40 * 1000;
    game.round = 2;
  } else if (words < 15) {
    game.difficulty.minLength = 5;
    game.difficulty.time = 35 * 1000;
    game.round = 3;
  } else if (words < 20) {
    game.difficulty.minLength = 6;
    game.difficulty.time = 30 * 1000;
    game.round = 4;
  } else if (words < 30) {
    game.difficulty.minLength = 7;
    game.difficulty.time = 25 * 1000;
    game.round = 5;
  } else {
    game.difficulty.minLength = 8;
    game.difficulty.time = 20 * 1000;
    game.round = 6;
  }
}

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ""
  );
}

function reply(sock, from, msg, text) {
  return sock.sendMessage(from, { text }, { quoted: msg });
}
