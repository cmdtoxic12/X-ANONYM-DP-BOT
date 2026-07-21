const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { checkPlugin } = require("./security");

const { getRegistry, saveRegistry } = require("./registry");

const { detectPlugin } = require("./detector");

const { convertLegacy } = require("./converter");

function extractGistId(input) {
  if (input.includes("gist.github.com")) {
    return input.split("/").pop().split("?")[0];
  }

  return input;
}

async function installPlugin(input) {
  const gist = extractGistId(input);

  const api = `https://api.github.com/gists/${gist}`;

  const response = await axios.get(api);

  const data = response.data;

  const files = Object.values(data.files)[0];

  let pluginCode = file.content;

  const type = detectPlugin(pluginCode);

  console.log("Plugin type:", type);

  if (type === "legacy") {
    console.log("🔄 Converting legacy plugin...");

    pluginCode = convertLegacy(pluginCode);
  }

  if (!files.length) throw new Error("No files found in Gist");

  const file = files[0];

  const scan = checkPlugin(file.content);

  if (!scan.safe) {
    throw new Error(`Blocked code: ${scan.reason}`);
  }

  let filename = file.filename;

  if (!filename.endsWith(".js")) filename += ".js";

  const pluginPath = path.join(process.cwd(), "plugins", filename);

  fs.writeFileSync(pluginPath, pluginCode);

  let registry = getRegistry();

  registry.push({
    name: filename,

    gist: gist,

    installed: new Date().toISOString(),
  });

  saveRegistry(registry);

  return filename;
}

module.exports = {
  installPlugin,
};
