const games = new Map();

module.exports = {
  name: "tictactoe",
  aliases: ["ttt"],

  async execute({ sock, from, msg, sender }) {
    if (games.has(from)) {
      return reply(sock, from, msg, "⚠️ TicTacToe already running.");
    }

    const mentioned =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!mentioned) {
      return reply(sock, from, msg, "Usage: .tictactoe @user");
    }

    if (mentioned === sender) {
      return reply(sock, from, msg, "❌ You cannot play against yourself.");
    }

    games.set(from, {
      players: [sender, mentioned],
      board: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      turn: sender,
      symbols: {
        [sender]: "❌",
        [mentioned]: "⭕",
      },
    });

    await sock.sendMessage(from, {
      text:
        `❌⭕ *TIC TAC TOE STARTED!*\n\n` +
        `❌ @${sender.split("@")[0]}\n` +
        `⭕ @${mentioned.split("@")[0]}\n\n` +
        boardText(games.get(from).board) +
        `\n\nTurn: @${sender.split("@")[0]}\nReply with number 1-9.`,
      mentions: [sender, mentioned],
    });
  },

  async before({ sock, from, msg, sender }) {
    const game = games.get(from);
    if (!game) return;

    const text = getText(msg).trim();
    if (!/^[1-9]$/.test(text)) return;

    if (sender !== game.turn) {
      return reply(sock, from, msg, "⏳ Not your turn.");
    }

    const index = Number(text) - 1;

    if (["❌", "⭕"].includes(game.board[index])) {
      return reply(sock, from, msg, "❌ That position is already taken.");
    }

    game.board[index] = game.symbols[sender];

    const winnerSymbol = checkWinner(game.board);

    if (winnerSymbol) {
      const winner = Object.keys(game.symbols).find(
        p => game.symbols[p] === winnerSymbol
      );

      games.delete(from);

      return sock.sendMessage(from, {
        text:
          `🏆 *TIC TAC TOE GAME OVER!*\n\n` +
          boardText(game.board) +
          `\n\nWinner: @${winner.split("@")[0]}`,
        mentions: [winner],
      });
    }

    if (game.board.every(x => ["❌", "⭕"].includes(x))) {
      games.delete(from);
      return sock.sendMessage(from, {
        text: `🤝 *DRAW!*\n\n${boardText(game.board)}`,
      });
    }

    game.turn = game.players.find(p => p !== sender);

    return sock.sendMessage(from, {
      text:
        boardText(game.board) +
        `\n\nTurn: @${game.turn.split("@")[0]}`,
      mentions: [game.turn],
    });
  },
};

function boardText(b) {
  return `
${b[0]} | ${b[1]} | ${b[2]}
---------
${b[3]} | ${b[4]} | ${b[5]}
---------
${b[6]} | ${b[7]} | ${b[8]}
`;
}

function checkWinner(b) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, c, d] of wins) {
    if (b[a] === b[c] && b[c] === b[d]) return b[a];
  }

  return null;
}

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ""
  );
}

function reply(sock, from, msg, text) {
  return sock.sendMessage(from, { text }, { quoted: msg });
}
