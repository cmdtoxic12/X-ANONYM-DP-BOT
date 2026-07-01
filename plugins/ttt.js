const games = new Map(); // Stores active games (chatId => game data)

module.exports = {
  name: "ttt",
  description: "Play full Tic Tac Toe with the bot (❌ You vs ⭕ Bot)",
  aliases: ["tictactoe", "xo"],

  async execute({ sock, from, msg }) {
    const chatId = from;
    const text = (msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();

    // Start new game
    if (text === ".ttt" || text === ".tictactoe") {
      if (games.has(chatId)) {
        return await sock.sendMessage(from, { text: "⚠️ You already have an ongoing game!\nUse `.ttt end` to stop it." }, { quoted: msg });
      }

      const board = Array(9).fill(null);
      games.set(chatId, { board, currentPlayer: "X" }); // X = Player

      return await sendBoard(sock, from, board, msg);
    }

    // End game
    if (text === ".ttt end" || text === ".ttt stop") {
      if (games.has(chatId)) {
        games.delete(chatId);
        return await sock.sendMessage(from, { text: "✅ Game ended." }, { quoted: msg });
      }
      return await sock.sendMessage(from, { text: "❌ No active game." }, { quoted: msg });
    }

    // Handle move (number 1-9)
    const num = parseInt(text);
    if (isNaN(num) || num < 1 || num > 9) return;

    const game = games.get(chatId);
    if (!game) {
      return await sock.sendMessage(from, { text: "❌ No active game. Start with `.ttt`" }, { quoted: msg });
    }

    const index = num - 1;
    if (game.board[index] !== null) {
      return await sock.sendMessage(from, { text: "❌ Position already taken!" }, { quoted: msg });
    }

    // Player move
    game.board[index] = "❌";
    if (checkWin(game.board, "❌")) {
      await sendBoard(sock, from, game.board, msg, "🎉 You Win!");
      games.delete(chatId);
      return;
    }
    if (game.board.every(cell => cell !== null)) {
      await sendBoard(sock, from, game.board, msg, "🤝 It's a Draw!");
      games.delete(chatId);
      return;
    }

    // Bot move
    game.board = botMove(game.board);
    await sendBoard(sock, from, game.board, msg);

    if (checkWin(game.board, "⭕")) {
      await sock.sendMessage(from, { text: "😎 Bot Wins!" }, { quoted: msg });
      games.delete(chatId);
    } else if (game.board.every(cell => cell !== null)) {
      await sock.sendMessage(from, { text: "🤝 It's a Draw!" }, { quoted: msg });
      games.delete(chatId);
    }
  }
};

// ==================== HELPER FUNCTIONS ====================

function sendBoard(sock, from, board, quotedMsg, extraText = "") {
  let str = `🎮 *Tic Tac Toe*\n❌ You  vs  ⭕ Bot\n\n`;
  
  for (let i = 0; i < 9; i += 3) {
    str += `${board[i] || (i+1)} | ${board[i+1] || (i+2)} | ${board[i+2] || (i+3)}\n`;
    if (i < 6) str += `———+———+———\n`;
  }

  str += `\nReply with number 1-9 to play.\n${extraText}`;

  return sock.sendMessage(from, { text: str }, { quoted: quotedMsg });
}

function botMove(board) {
  // Simple AI: Win if possible, block player, else random
  const winningCombos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  // Try to win
  for (let combo of winningCombos) {
    const [a,b,c] = combo;
    if (board[a] === "⭕" && board[b] === "⭕" && !board[c]) return makeMove(board, c);
    if (board[a] === "⭕" && board[c] === "⭕" && !board[b]) return makeMove(board, b);
    if (board[b] === "⭕" && board[c] === "⭕" && !board[a]) return makeMove(board, a);
  }

  // Block player
  for (let combo of winningCombos) {
    const [a,b,c] = combo;
    if (board[a] === "❌" && board[b] === "❌" && !board[c]) return makeMove(board, c);
    if (board[a] === "❌" && board[c] === "❌" && !board[b]) return makeMove(board, b);
    if (board[b] === "❌" && board[c] === "❌" && !board[a]) return makeMove(board, a);
  }

  // Random empty spot
  let empty = board.map((v,i) => v === null ? i : null).filter(v => v !== null);
  return makeMove(board, empty[Math.floor(Math.random() * empty.length)]);
}

function makeMove(board, index) {
  board[index] = "⭕";
  return board;
}

function checkWin(board, player) {
  const combos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return combos.some(([a,b,c]) => board[a] === player && board[b] === player && board[c] === player);
}