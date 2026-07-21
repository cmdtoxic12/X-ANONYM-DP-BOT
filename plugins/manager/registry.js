const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "installed.json");

function getRegistry() {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
  }

  return JSON.parse(fs.readFileSync(file));
}

function saveRegistry(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  getRegistry,
  saveRegistry,
};
