const simpleGit = require("simple-git");
const { exec } = require("child_process");
const util = require("util");

const execAsync = util.promisify(exec);

const git = simpleGit();

let updating = false;

async function sendOwner(sock, config, text) {
  try {
    const owner = config.OWNER_NUMBER.replace(/\D/g, "") + "@s.whatsapp.net";

    await sock.sendMessage(owner, {
      text,
    });
  } catch (err) {
    console.log("Owner notify failed:", err.message);
  }
}

async function getBranch() {
  try {
    const branch = await git.revparse(["--abbrev-ref", "HEAD"]);

    return branch.trim();
  } catch {
    return "main";
  }
}

async function autoUpdate(sock, config) {
  if (updating) {
    console.log("⏳ Update already running...");

    return;
  }

  updating = true;

  try {
    console.log("🔍 Checking GitHub updates...");

    // Check git installed
    await execAsync("git --version");

    const branch = await getBranch();

    await git.fetch();

    const local = await git.revparse(["HEAD"]);

    let remote;

    try {
      remote = await git.revparse([`origin/${branch}`]);
    } catch {
      console.log("No remote branch found");

      updating = false;

      return;
    }

    console.log("Local:", local);

    console.log("Remote:", remote);

    if (local === remote) {
      console.log("✅ No updates");

      updating = false;

      return;
    }

    console.log("⬇️ Update detected");

    await sendOwner(
      sock,
      config,
      `⬇️ *Bot Update Found*

Branch:
${branch}

Updating now...`,
    );

    // Check local changes

    const status = await git.status();

    if (status.files.length) {
      console.log("⚠️ Local changes detected");

      await git.stash();
    }

    await git.pull("origin", branch);

    console.log("📦 Installing packages...");

    await execAsync("npm install");

    await sendOwner(
      sock,
      config,
      `✅ *Update Completed*

♻️ Restarting bot...`,
    );

    console.log("♻️ Restarting...");

    process.exit(0);
  } catch (error) {
    console.log("❌ Update failed:", error.message);

    await sendOwner(
      sock,
      config,
      `❌ Update failed

${error.message}`,
    );
  } finally {
    updating = false;
  }
}

module.exports = {
  autoUpdate,
};
