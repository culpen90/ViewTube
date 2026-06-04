const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

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

function formatDuration(duration) {
  const match = String(duration || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return "YouTube";

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const parts = hours > 0 ? [hours, minutes, seconds] : [minutes, seconds];

  return parts.map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0"))).join(":");
}

function formatViews(viewCount) {
  const views = Number(viewCount || 0);
  if (!Number.isFinite(views) || views <= 0) return "YouTube views";

  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact"
  });

  return `${formatter.format(views)} views`;
}

function formatPublishedAt(publishedAt) {
  if (!publishedAt) return "YouTube";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(publishedAt));
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

async function handleSearch(url, response) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    sendJson(response, 400, { error: "Search query is required." });
    return;
  }

  if (!apiKey) {
    sendJson(response, 501, {
      enabled: false,
      error: "Set YOUTUBE_API_KEY to enable in-app YouTube search."
    });
    return;
  }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("maxResults", "12");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("safeSearch", "moderate");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoEmbeddable", "true");
  searchUrl.searchParams.set("key", apiKey);

  try {
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      sendJson(response, searchResponse.status, {
        error: searchData.error?.message || "YouTube search failed."
      });
      return;
    }

    const ids = searchData.items.map((item) => item.id?.videoId).filter(Boolean);

    if (ids.length === 0) {
      sendJson(response, 200, { enabled: true, videos: [] });
      return;
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,contentDetails,statistics,status");
    videosUrl.searchParams.set("id", ids.join(","));
    videosUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      sendJson(response, videosResponse.status, {
        error: videosData.error?.message || "YouTube video lookup failed."
      });
      return;
    }

    const videos = videosData.items
      .filter((item) => item.status?.embeddable !== false)
      .map((item, index) => ({
        id: item.id,
        title: item.snippet?.title || "YouTube video",
        channel: item.snippet?.channelTitle || "YouTube",
        avatar: initials(item.snippet?.channelTitle),
        avatarClass: ["sky", "coral", "lime", "violet"][index % 4],
        subscribers: "YouTube search result",
        views: formatViews(item.statistics?.viewCount),
        age: formatPublishedAt(item.snippet?.publishedAt),
        duration: formatDuration(item.contentDetails?.duration),
        category: "Search",
        description: item.snippet?.description || "A YouTube video from search results."
      }));

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
    await handleSearch(url, response);
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
