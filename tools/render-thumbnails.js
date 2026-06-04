const { spawnSync } = require("node:child_process");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");

const root = resolve(__dirname, "..");
const renderer = resolve(__dirname, "thumbnail-renderer.html");
const outputDir = resolve(root, "assets", "thumbnails");
const chromium = process.env.CHROMIUM || "/usr/bin/chromium";
const ids = [
  "studio-desk",
  "city-food",
  "space-news",
  "pixel-run",
  "lofi-live",
  "mountain-bike",
  "coffee-review",
  "train-travel",
  "frontend-build",
  "morning-market"
];

mkdirSync(outputDir, { recursive: true });

for (const id of ids) {
  const url = `${pathToFileURL(renderer).href}?id=${encodeURIComponent(id)}`;
  const out = resolve(outputDir, `${id}.png`);
  const result = spawnSync(
    chromium,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=1000",
      "--window-size=1280,720",
      `--screenshot=${out}`,
      url
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error(`Could not render ${id}`);
  }
}
