const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const youtubeDl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");
const ytSearch = require("yt-search");

const TEMP_DIR = path.join(os.tmpdir(), "clicon-youtube-downloads");

const DEFAULT_TIMEOUT = 5 * 60 * 1000;
const MAX_AUDIO_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function sanitizeFileName(value) {
  return (
    String(value || "media")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 70) || "media"
  );
}

function isYouTubeUrl(value) {
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(
    String(value || "").trim(),
  );
}

function formatDuration(seconds) {
  const total = Number(seconds);

  if (!Number.isFinite(total) || total <= 0) {
    return "Unknown";
  }

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = Math.floor(total % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remaining,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function createToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function ensureTempDirectory() {
  await fs.ensureDir(TEMP_DIR);
}

async function searchYouTube(query) {
  const results = await ytSearch(query);
  const video = results.videos?.[0];

  if (!video) {
    throw new Error("No matching YouTube video was found.");
  }

  return {
    id: video.videoId,
    url: video.url,
    title: video.title,
    thumbnail: video.thumbnail || null,
    duration: video.timestamp || "Unknown",
    durationSeconds: Number(video.seconds || 0),
    channel: video.author?.name || "Unknown",
  };
}

async function getVideoInformation(url) {
  const info = await youtubeDl(
    url,
    {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
      skipDownload: true,
    },
    {
      timeout: DEFAULT_TIMEOUT,
      windowsHide: true,
    },
  );

  return {
    id: info.id,
    url,
    title: info.title || "YouTube media",
    thumbnail:
      info.thumbnail ||
      info.thumbnails?.[info.thumbnails.length - 1]?.url ||
      null,
    duration: formatDuration(info.duration),
    durationSeconds: Number(info.duration || 0),
    channel: info.uploader || info.channel || "Unknown",
  };
}

async function resolveVideo(input) {
  const value = String(input || "").trim();

  if (!value) {
    throw new Error("Enter a song title or YouTube URL.");
  }

  if (isYouTubeUrl(value)) {
    return getVideoInformation(value);
  }

  return searchYouTube(value);
}

async function findGeneratedFile(token, expectedExtension) {
  const files = await fs.readdir(TEMP_DIR);

  const matches = files.filter((file) => {
    return (
      file.startsWith(`${token}-`) &&
      file.toLowerCase().endsWith(expectedExtension.toLowerCase())
    );
  });

  if (!matches.length) {
    return null;
  }

  matches.sort();

  return path.join(TEMP_DIR, matches[matches.length - 1]);
}

async function validateDownloadedFile(filePath, maxBytes) {
  if (!filePath || !(await fs.pathExists(filePath))) {
    throw new Error("The downloaded file could not be found.");
  }

  const stats = await fs.stat(filePath);

  if (!stats.isFile() || stats.size === 0) {
    throw new Error("The downloaded file is empty.");
  }

  if (stats.size > maxBytes) {
    await fs.remove(filePath).catch(() => {});

    throw new Error(
      `The downloaded file is too large: ${formatBytes(stats.size)}.`,
    );
  }

  return stats;
}

async function downloadAudio(url, title = "audio") {
  await ensureTempDirectory();

  if (!ffmpegPath) {
    throw new Error("FFmpeg is not available on this platform.");
  }

  const token = createToken();

  // Do not put the video title here.
  // Titles contain spaces and special characters.
  const outputTemplate = `${token}.%(ext)s`;

  try {
    await youtubeDl(
      url,
      {
        noPlaylist: true,
        extractAudio: true,
        audioFormat: "mp3",
        audioQuality: "5",
        format: "bestaudio/best",
        ffmpegLocation: ffmpegPath,
        output: outputTemplate,
        noWarnings: true,
      },
      {
        cwd: TEMP_DIR,
        timeout: DEFAULT_TIMEOUT,
        windowsHide: true,
      },
    );

    const filePath = path.join(TEMP_DIR, `${token}.mp3`);

    await validateDownloadedFile(filePath, MAX_AUDIO_BYTES);

    return filePath;
  } catch (error) {
    await removeFilesByToken(token);
    throw normalizeDownloaderError(error);
  }
}

async function downloadVideo(url, title = "video") {
  await ensureTempDirectory();

  if (!ffmpegPath) {
    throw new Error("FFmpeg is not available on this platform.");
  }

  const token = createToken();
  const outputTemplate = `${token}.%(ext)s`;

  try {
    await youtubeDl(
      url,
      {
        noPlaylist: true,
        format: "bv*[height<=720]+ba/b[height<=720]",
        mergeOutputFormat: "mp4",
        ffmpegLocation: ffmpegPath,
        output: outputTemplate,
        noWarnings: true,
      },
      {
        cwd: TEMP_DIR,
        timeout: DEFAULT_TIMEOUT,
        windowsHide: true,
      },
    );

    const filePath = path.join(TEMP_DIR, `${token}.mp4`);

    await validateDownloadedFile(filePath, MAX_VIDEO_BYTES);

    return filePath;
  } catch (error) {
    await removeFilesByToken(token);
    throw normalizeDownloaderError(error);
  }
}

async function removeFilesByToken(token) {
  if (!token || !(await fs.pathExists(TEMP_DIR))) {
    return;
  }

  const files = await fs.readdir(TEMP_DIR);

  await Promise.all(
    files
      .filter((file) => file.startsWith(`${token}-`))
      .map((file) => fs.remove(path.join(TEMP_DIR, file)).catch(() => {})),
  );
}

async function removeTemporaryFile(filePath) {
  if (!filePath) return;
  await fs.remove(filePath).catch(() => {});
}

async function clearOldTemporaryFiles(maxAgeMs = 60 * 60 * 1000) {
  await ensureTempDirectory();

  const files = await fs.readdir(TEMP_DIR);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);

    try {
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        await fs.remove(filePath);
      }
    } catch {
      // Ignore temporary cleanup failures.
    }
  }
}

function normalizeDownloaderError(error) {
  const raw =
    error?.stderr?.toString?.() ||
    error?.stdout?.toString?.() ||
    error?.message ||
    String(error);

  const text = raw.trim();

  if (/sign in|confirm you.?re not a bot/i.test(text)) {
    return new Error("YouTube requires account verification for this video.");
  }

  if (/private video/i.test(text)) {
    return new Error("This YouTube video is private.");
  }

  if (/video unavailable/i.test(text)) {
    return new Error("This YouTube video is unavailable.");
  }

  if (/copyright|not available in your country/i.test(text)) {
    return new Error("This video is restricted in the server's region.");
  }

  if (/timeout|timed out/i.test(text)) {
    return new Error("The download took too long and was stopped.");
  }

  if (/ffmpeg/i.test(text) && /not found|missing/i.test(text)) {
    return new Error("FFmpeg could not be found.");
  }

  return new Error(text.slice(0, 1200) || "The downloader failed.");
}

function formatBytes(bytes) {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );

  return `${(value / 1024 ** index).toFixed(2)} ${units[index]}`;
}

module.exports = {
  resolveVideo,
  searchYouTube,
  getVideoInformation,
  downloadAudio,
  downloadVideo,
  removeTemporaryFile,
  clearOldTemporaryFiles,
  sanitizeFileName,
  formatDuration,
  formatBytes,
  isYouTubeUrl,
};
