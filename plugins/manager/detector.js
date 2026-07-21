function detectPlugin(code) {
  // Your current format
  if (code.includes("module.exports") && code.includes("execute")) {
    return "clicon";
  }

  // Legacy frameworks
  if (code.includes("bot(") && code.includes("pattern:")) {
    return "legacy";
  }

  // Another common format
  if (code.includes("handler:")) {
    return "handler";
  }

  return "unknown";
}

module.exports = {
  detectPlugin,
};
