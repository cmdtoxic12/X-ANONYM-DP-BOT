const blocked = [
  "child_process",
  "exec(",
  "spawn(",
  "eval(",
  "process.exit",
  "rmSync",
  "fs.rm",
];

function checkPlugin(code) {
  for (const item of blocked) {
    if (code.includes(item)) {
      return {
        safe: false,
        reason: item,
      };
    }
  }

  return {
    safe: true,
  };
}

module.exports = {
  checkPlugin,
};
