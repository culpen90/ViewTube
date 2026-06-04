const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const youtubeSearchMaxResults = 12;
const youtubeSearchCacheTtlMs = 5 * 60 * 1000;
const youtubePlayabilityCacheTtlMs = 60 * 60 * 1000;
const youtubePlayabilityBatchSize = 8;
const youtubeSearchUserAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";
const youtubeSearchCache = new Map();
const youtubePlayabilityCache = new Map();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function baseHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    ...baseHeaders("application/json; charset=utf-8"),
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function initials(value) {
  return String(value || "YT")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function textFrom(value) {
  if (!value) return "";
  if (typeof value === "string") return compactText(value);
  if (typeof value.simpleText === "string") return compactText(value.simpleText);
  if (Array.isArray(value.runs)) return compactText(value.runs.map((run) => run.text || "").join(""));
  if (value.accessibility?.accessibilityData?.label) return compactText(value.accessibility.accessibilityData.label);
  return "";
}

function extractJsonObjectAt(html, start) {
  if (start === -1) return "";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }

      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return html.slice(start, index + 1);
      }
    }
  }

  return "";
}

function extractJsonObjectAfter(html, marker, fromIndex = 0) {
  const markerIndex = html.indexOf(marker, fromIndex);
  if (markerIndex === -1) return "";

  return extractJsonObjectAt(html, html.indexOf("{", markerIndex));
}

function parseYtInitialData(html) {
  const markers = ["var ytInitialData =", "ytInitialData =", "window[\"ytInitialData\"] ="];

  for (const marker of markers) {
    const json = extractJsonObjectAfter(html, marker);
    if (!json) continue;

    try {
      return JSON.parse(json);
    } catch {
      // Try the next known assignment shape.
    }
  }

  return null;
}

function parseEmbeddedPlayerResponse(html) {
  let markerIndex = 0;

  while ((markerIndex = html.indexOf("ytcfg.set(", markerIndex)) !== -1) {
    const json = extractJsonObjectAfter(html, "ytcfg.set(", markerIndex);
    markerIndex += "ytcfg.set(".length;
    if (!json) continue;

    try {
      const config = JSON.parse(json);
      const response = config.PLAYER_VARS?.embedded_player_response;
      if (!response) continue;

      return typeof response === "string" ? JSON.parse(response) : response;
    } catch {
      // Keep scanning other ytcfg.set calls.
    }
  }

  return null;
}

function collectVideoRenderers(value, renderers = []) {
  if (!value || typeof value !== "object" || renderers.length >= 50) return renderers;

  if (value.videoRenderer) {
    renderers.push(value.videoRenderer);
    return renderers;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectVideoRenderers(item, renderers);
    return renderers;
  }

  for (const item of Object.values(value)) collectVideoRenderers(item, renderers);
  return renderers;
}

function videoIdFromRenderer(renderer) {
  return (
    renderer.videoId ||
    renderer.navigationEndpoint?.watchEndpoint?.videoId ||
    renderer.thumbnailOverlays
      ?.map((overlay) => overlay.thumbnailOverlayNowPlayingRenderer?.navigationEndpoint?.watchEndpoint?.videoId)
      .find(Boolean) ||
    ""
  );
}

function isLiveRenderer(renderer) {
  const badgeText = (renderer.badges || [])
    .map((badge) => {
      const metadata = badge.metadataBadgeRenderer || {};
      return textFrom(metadata.label) || textFrom(metadata.tooltip) || textFrom(metadata);
    })
    .join(" ");

  const hasLiveOverlay = (renderer.thumbnailOverlays || []).some((overlay) => {
    const status = overlay.thumbnailOverlayTimeStatusRenderer;
    return status?.style === "LIVE" || textFrom(status?.text).toUpperCase() === "LIVE";
  });

  return /\bLIVE\b/i.test(badgeText) || hasLiveOverlay;
}

function mapSearchRenderer(renderer, index) {
  const title = textFrom(renderer.title) || "YouTube video";
  const channel = textFrom(renderer.ownerText) || textFrom(renderer.shortBylineText) || textFrom(renderer.longBylineText) || "YouTube";
  const live = isLiveRenderer(renderer);
  const views = textFrom(renderer.viewCountText) || textFrom(renderer.shortViewCountText) || (live ? "Live now" : "YouTube views");
  const age = textFrom(renderer.publishedTimeText) || (live ? "Live now" : "YouTube");
  const duration = live ? "LIVE" : textFrom(renderer.lengthText) || "YouTube";
  const description =
    textFrom(renderer.descriptionSnippet) ||
    textFrom(renderer.detailedMetadataSnippets?.[0]?.snippetText) ||
    `${title} by ${channel}, found in YouTube search results.`;

  return {
    id: videoIdFromRenderer(renderer),
    title,
    channel,
    avatar: initials(channel),
    avatarClass: ["sky", "coral", "lime", "violet"][index % 4],
    subscribers: "YouTube search result",
    views,
    age,
    duration,
    live,
    category: "Search",
    description
  };
}

async function canPlayInEmbed(videoId, appOrigin) {
  const cacheKey = `${appOrigin} ${videoId}`;
  const cached = youtubePlayabilityCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < youtubePlayabilityCacheTtlMs) {
    return cached.playable;
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  embedUrl.searchParams.set("autoplay", "0");
  embedUrl.searchParams.set("playsinline", "1");
  embedUrl.searchParams.set("rel", "0");
  embedUrl.searchParams.set("enablejsapi", "1");
  embedUrl.searchParams.set("origin", appOrigin);
  embedUrl.searchParams.set("widget_referrer", `${appOrigin}/`);

  let playable = false;

  try {
    const youtubeResponse = await fetch(embedUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: `${appOrigin}/`,
        "User-Agent": youtubeSearchUserAgent
      }
    });

    if (youtubeResponse.ok) {
      const html = await youtubeResponse.text();
      const playerResponse = parseEmbeddedPlayerResponse(html);
      const playability = playerResponse?.previewPlayabilityStatus || {};

      playable =
        playability.status === "OK" &&
        playability.playableInEmbed === true &&
        Boolean(playerResponse?.embedPreview);
    }
  } catch {
    playable = false;
  }

  if (youtubePlayabilityCache.size > 200) {
    youtubePlayabilityCache.clear();
  }

  youtubePlayabilityCache.set(cacheKey, {
    timestamp: Date.now(),
    playable
  });

  return playable;
}

async function filterEmbeddableVideos(candidates, appOrigin) {
  const videos = [];

  for (
    let index = 0;
    index < candidates.length && videos.length < youtubeSearchMaxResults;
    index += youtubePlayabilityBatchSize
  ) {
    const batch = candidates.slice(index, index + youtubePlayabilityBatchSize);
    const playableResults = await Promise.all(batch.map((video) => canPlayInEmbed(video.id, appOrigin)));

    for (const [batchIndex, playable] of playableResults.entries()) {
      if (playable) {
        videos.push(batch[batchIndex]);
      }

      if (videos.length >= youtubeSearchMaxResults) {
        break;
      }
    }
  }

  return videos;
}

async function searchYouTube(query, appOrigin) {
  const cacheKey = `${appOrigin} ${query.toLowerCase()}`;
  const cached = youtubeSearchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < youtubeSearchCacheTtlMs) {
    return cached.videos;
  }

  const searchUrl = new URL("https://www.youtube.com/results");
  searchUrl.searchParams.set("search_query", query);
  searchUrl.searchParams.set("sp", "EgIQAQ==");
  searchUrl.searchParams.set("hl", "en");
  searchUrl.searchParams.set("gl", "US");

  const youtubeResponse = await fetch(searchUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": youtubeSearchUserAgent
    }
  });

  if (!youtubeResponse.ok) {
    throw new Error(`YouTube search returned ${youtubeResponse.status}`);
  }

  const html = await youtubeResponse.text();
  const initialData = parseYtInitialData(html);

  if (!initialData) {
    throw new Error("YouTube search data was not present in the response.");
  }

  const seen = new Set();
  const candidates = collectVideoRenderers(initialData)
    .map(mapSearchRenderer)
    .filter((video) => {
      if (!/^[a-zA-Z0-9_-]{11}$/.test(video.id) || seen.has(video.id)) return false;
      seen.add(video.id);
      return true;
    });
  const videos = await filterEmbeddableVideos(candidates, appOrigin);

  if (youtubeSearchCache.size > 50) {
    youtubeSearchCache.clear();
  }

  youtubeSearchCache.set(cacheKey, {
    timestamp: Date.now(),
    videos
  });

  return videos;
}

async function handleOEmbed(url, response) {
  const id = url.searchParams.get("id") || "";

  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    sendJson(response, 400, { error: "Invalid YouTube video ID." });
    return;
  }

  const oembedUrl = new URL("https://www.youtube.com/oembed");
  oembedUrl.searchParams.set("url", `https://www.youtube.com/watch?v=${id}`);
  oembedUrl.searchParams.set("format", "json");

  try {
    const youtubeResponse = await fetch(oembedUrl);

    if (!youtubeResponse.ok) {
      sendJson(response, youtubeResponse.status, { error: "YouTube metadata was not available." });
      return;
    }

    const data = await youtubeResponse.json();
    sendJson(response, 200, {
      id,
      title: data.title,
      channel: data.author_name,
      thumbnail: data.thumbnail_url
    });
  } catch {
    sendJson(response, 502, { error: "Unable to reach YouTube metadata." });
  }
}

function appOriginFromRequest(request) {
  const host = String(request.headers.host || `127.0.0.1:${port}`).replace(/[^a-zA-Z0-9.:-]/g, "");
  return `http://${host || `127.0.0.1:${port}`}`;
}

async function handleSearch(request, url, response) {
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    sendJson(response, 400, { error: "Search query is required." });
    return;
  }

  try {
    const videos = await searchYouTube(query, appOriginFromRequest(request));
    sendJson(response, 200, { enabled: true, videos });
  } catch {
    sendJson(response, 502, { error: "Unable to reach YouTube search." });
  }
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://127.0.0.1:${port}`);
  let decodedPath = "";

  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    return "";
  }

  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.normalize(path.join(root, requestedPath));
  const relativePath = path.relative(root, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return "";
  }

  return filePath;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);

  if (url.pathname === "/api/oembed") {
    await handleOEmbed(url, response);
    return;
  }

  if (url.pathname === "/api/search") {
    await handleSearch(request, url, response);
    return;
  }

  const filePath = resolveRequestPath(request.url);

  if (!filePath) {
    response.writeHead(403, baseHeaders("text/plain; charset=utf-8"));
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, baseHeaders("text/plain; charset=utf-8"));
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    response.writeHead(200, baseHeaders(contentTypes[path.extname(filePath)] || "application/octet-stream"));
    response.end(content);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`ViewTube running at http://127.0.0.1:${port}/`);
});
