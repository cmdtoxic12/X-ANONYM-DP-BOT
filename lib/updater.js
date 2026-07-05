const simpleGit = require("simple-git");
const { exec } = require("child_process");

const git = simpleGit();

async function autoUpdate(sock, config) {
  try {
    console.log("🔍 Checking GitHub for updates...");

    await git.fetch();

    const localCommit = await git.revparse(["HEAD"]);
    const remoteCommit = await git.revparse(["origin/main"]);

    console.log("Local :", localCommit);
    console.log("Remote:", remoteCommit);

    if (localCommit === remoteCommit) {
      console.log("✅ No update found.");
      return;
    }

    console.log("⬇️ New update found. Pulling...");

    await sock.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
      text: "⬇️ New GitHub update found.\nUpdating bot now..."
    }).catch(() => {});

    await git.pull("origin", "main");

    exec("npm install", async (err) => {
      if (err) {
        console.log("❌ npm install failed:", err.message);
        return;
      }

      await sock.sendMessage(config.OWNER_NUMBER + "@s.whatsapp.net", {
        text: "✅ Update installed.\n♻️ Restarting bot..."
      }).catch(() => {});

      process.exit(0);
    });

  } catch (err) {
    console.log("❌ Auto update error:", err.message);
  }
}

module.exports = { autoUpdate };
