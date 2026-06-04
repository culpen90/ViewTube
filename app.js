const starterVideos = [
  {
    id: "tgbNymZ7vqY",
    title: "Bohemian Rhapsody | Muppet Music Video | The Muppets",
    channel: "The Muppets",
    avatar: "TM",
    avatarClass: "coral",
    subscribers: "Official channel",
    views: "Music video",
    age: "Official upload",
    duration: "4:47",
    category: "Music",
    description:
      "The Muppets' official Bohemian Rhapsody music video, served through YouTube's embedded player."
  },
  {
    id: "jNQXAC9IVRw",
    title: "Me at the zoo",
    channel: "jawed",
    avatar: "J",
    avatarClass: "sky",
    subscribers: "YouTube co-founder",
    views: "Historic upload",
    age: "Apr 23, 2005",
    duration: "0:19",
    category: "History",
    description:
      "The first video uploaded to YouTube, served through YouTube's embedded player."
  },
  {
    id: "bMknfKXIFA8",
    title: "React Course - Beginner's Tutorial for React JavaScript Library [2022]",
    channel: "freeCodeCamp.org",
    avatar: "FC",
    avatarClass: "lime",
    subscribers: "Developer education channel",
    views: "Full course",
    age: "React tutorial",
    duration: "11:55:27",
    category: "Tech",
    description:
      "A full React course from freeCodeCamp, embedded directly from YouTube."
  },
  {
    id: "8aGhZQkoFbQ",
    title: "What the heck is the event loop anyway? | Philip Roberts | JSConf EU",
    channel: "JSConf",
    avatar: "JS",
    avatarClass: "violet",
    subscribers: "Conference channel",
    views: "Learning video",
    age: "JSConf EU",
    duration: "26:52",
    category: "Coding",
    description:
      "A well-known JavaScript conference talk served from YouTube."
  },
  {
    id: "g4Hbz2jLxvQ",
    title: "SPIDER-MAN: INTO THE SPIDER-VERSE - Official Trailer (HD)",
    channel: "Sony Pictures Entertainment",
    avatar: "SP",
    avatarClass: "sky",
    subscribers: "Official movie channel",
    views: "Trailer",
    age: "Official trailer",
    duration: "2:41",
    category: "Entertainment",
    description:
      "A verified embeddable official movie trailer served by YouTube."
  },
  {
    id: "YE7VzlLtp-4",
    title: "Big Buck Bunny",
    channel: "Blender Foundation",
    avatar: "BF",
    avatarClass: "lime",
    subscribers: "Open movie channel",
    views: "Open film",
    age: "Short film",
    duration: "9:56",
    category: "Film",
    description:
      "The Blender Foundation's open short film on YouTube."
  },
  {
    id: "LXb3EKWsInQ",
    title: "COSTA RICA IN 4K 60fps HDR (ULTRA HD)",
    channel: "Jacob + Katie Schwarz",
    avatar: "JK",
    avatarClass: "coral",
    subscribers: "Travel film channel",
    views: "4K travel video",
    age: "Travel",
    duration: "5:14",
    category: "Travel",
    description:
      "A real YouTube travel film embedded in the ViewTube player."
  },
  {
    id: "MmB9b5njVbA",
    title: "Official Minecraft Trailer",
    channel: "Minecraft",
    avatar: "MC",
    avatarClass: "lime",
    subscribers: "Official game channel",
    views: "Game trailer",
    age: "Official trailer",
    duration: "1:00",
    category: "Gaming",
    description:
      "The official Minecraft trailer served through YouTube."
  },
  {
    id: "F3zw1Gvn4Mk",
    title: "Mr Fox Restaurant Promo Video",
    channel: "Mr Fox",
    avatar: "MF",
    avatarClass: "coral",
    subscribers: "Restaurant channel",
    views: "Food video",
    age: "Promo",
    duration: "1:00",
    category: "Food",
    description:
      "A real food and restaurant video embedded from YouTube."
  },
  {
    id: "hFZFjoX2cGg",
    title: "Backyard Squirrel Maze 1.0 - Ninja Warrior Course",
    channel: "Mark Rober",
    avatar: "MR",
    avatarClass: "violet",
    subscribers: "Science and engineering channel",
    views: "Popular video",
    age: "Engineering build",
    duration: "21:39",
    category: "Science",
    description:
      "A real engineering video from YouTube, shown in the embedded player."
  }
];

const shorts = [
  {
    id: "jNQXAC9IVRw",
    title: "Me at the zoo",
    views: "Historic YouTube short upload"
  },
  {
    id: "MmB9b5njVbA",
    title: "Official Minecraft Trailer",
    views: "Game trailer"
  },
  {
    id: "tgbNymZ7vqY",
    title: "Bohemian Rhapsody",
    views: "Official music video"
  },
  {
    id: "F3zw1Gvn4Mk",
    title: "Restaurant promo",
    views: "Food video"
  },
  {
    id: "g4Hbz2jLxvQ",
    title: "Spider-Verse trailer",
    views: "Official trailer"
  }
];

const categories = [
  "All",
  "Music",
  "Gaming",
  "Coding",
  "Tech",
  "Science",
  "Food",
  "Travel",
  "Film",
  "History",
  "Entertainment"
];

const state = {
  category: "All",
  query: "",
  loading: false,
  notice: "",
  remoteVideos: null
};

const videos = [...starterVideos];
const externalVideos = new Map();

const chipRow = document.querySelector("#chipRow");
const videoGrid = document.querySelector("#videoGrid");
const shortsGrid = document.querySelector("#shortsGrid");
const resultSummary = document.querySelector("#resultSummary");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const refreshButton = document.querySelector("#refreshButton");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");
const watchDrawer = document.querySelector("#watchDrawer");
const watchFrame = document.querySelector("#watchFrame");
const watchTitle = document.querySelector("#watchTitle");
const watchAvatar = document.querySelector("#watchAvatar");
const watchChannel = document.querySelector("#watchChannel");
const watchSubscribers = document.querySelector("#watchSubscribers");
const watchDescription = document.querySelector("#watchDescription");
const watchYouTubeLink = document.querySelector("#watchYouTubeLink");
const upNextList = document.querySelector("#upNextList");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function thumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function youtubeUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function channelInitials(value) {
  return String(value || "YT")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function embedUrl(videoId) {
  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");

  if (window.location.origin && window.location.origin !== "null") {
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("origin", window.location.origin);
    url.searchParams.set("widget_referrer", window.location.href);
  }

  return url.toString();
}

function updateAddressVideo(videoId) {
  if (!window.history || !window.history.replaceState) return;

  const url = new URL(window.location.href);

  if (videoId) {
    url.searchParams.set("v", videoId);
  } else {
    url.searchParams.delete("v");
  }

  url.searchParams.delete("video");
  url.hash = "";
  window.history.replaceState(null, "", url);
}

function extractYouTubeId(value) {
  const trimmed = value.trim();
  const urlCandidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(urlCandidate);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (/^[a-zA-Z0-9_-]{11}$/.test(fromQuery || "")) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      const embeddedId = parts.find((part, index) => ["embed", "shorts", "live"].includes(parts[index - 1]));
      return /^[a-zA-Z0-9_-]{11}$/.test(embeddedId || "") ? embeddedId : "";
    }
  } catch {
    return "";
  }

  return "";
}

function videoIdFromLocation() {
  const url = new URL(window.location.href);
  const hash = url.hash.replace(/^#/, "");
  const hashParams = new URLSearchParams(hash);
  const candidates = [
    url.searchParams.get("v"),
    url.searchParams.get("video"),
    hashParams.get("v"),
    hashParams.get("video"),
    hashParams.get("watch"),
    hash
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const videoId = extractYouTubeId(candidate);
    if (videoId) return videoId;
  }

  return "";
}

function getVideo(videoId) {
  return (
    videos.find((video) => video.id === videoId) ||
    state.remoteVideos?.find((video) => video.id === videoId) ||
    externalVideos.get(videoId)
  );
}

function makeExternalVideo(videoId) {
  if (!externalVideos.has(videoId)) {
    externalVideos.set(videoId, {
      id: videoId,
      title: `YouTube video ${videoId}`,
      channel: "YouTube",
      avatar: "YT",
      avatarClass: "coral",
      subscribers: "Loaded from URL",
      views: "Real YouTube video",
      age: "Opened from search",
      duration: "YouTube",
      category: "All",
      description:
        "This video was opened from a YouTube URL or video ID and is served through YouTube's official embedded player."
    });
  }

  return externalVideos.get(videoId);
}

async function hydrateExternalVideo(videoId) {
  const selected = externalVideos.get(videoId);
  if (!selected) return;

  try {
    const response = await fetch(`/api/oembed?id=${encodeURIComponent(videoId)}`);
    if (!response.ok) return;

    const data = await response.json();
    selected.title = data.title || selected.title;
    selected.channel = data.channel || selected.channel;
    selected.avatar = channelInitials(selected.channel);
    selected.subscribers = "YouTube video";
    selected.description = `${selected.title} by ${selected.channel}, served through YouTube's official embedded player.`;

    if (!watchDrawer.hidden && watchFrame.src.includes(`/embed/${videoId}`)) {
      watchFrame.title = selected.title;
      watchTitle.textContent = selected.title;
      watchAvatar.textContent = selected.avatar;
      watchChannel.textContent = selected.channel;
      watchSubscribers.textContent = selected.subscribers;
      watchDescription.textContent = selected.description;
    }
  } catch {
    // Keep the generic metadata if YouTube oEmbed is unavailable.
  }
}

function renderChips() {
  chipRow.innerHTML = categories
    .map((category) => {
      const active = category === state.category ? " is-active" : "";
      return `<button class="chip${active}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`;
    })
    .join("");
}

function getFilteredVideos() {
  const normalizedQuery = state.query.trim().toLowerCase();

  return videos.filter((video) => {
    const categoryMatch = state.category === "All" || video.category === state.category;

    const textMatch =
      !normalizedQuery ||
      [video.title, video.channel, video.category, video.description, video.id].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );

    return categoryMatch && textMatch;
  });
}

function renderVideos() {
  const showingRemote = Array.isArray(state.remoteVideos);
  const filtered = showingRemote ? state.remoteVideos : getFilteredVideos();

  if (state.loading) {
    videoGrid.innerHTML = `<div class="empty-state"><span>Searching YouTube...</span></div>`;
  } else if (filtered.length === 0) {
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(state.query)}`;
    const message = showingRemote ? "No YouTube results found." : "No local matches.";
    videoGrid.innerHTML = `
      <div class="empty-state">
        <span>${escapeHtml(message)}</span>
        <a href="${youtubeSearchUrl}" target="_blank" rel="noopener">Search YouTube</a>
      </div>
    `;
  } else {
    videoGrid.innerHTML = filtered.map(renderVideoCard).join("");
  }

  if (state.loading) {
    resultSummary.textContent = `Searching YouTube for "${state.query}"`;
    return;
  }

  const label = showingRemote
    ? `YouTube results for "${state.query}"`
    : state.category === "All"
      ? "Real YouTube videos"
      : `${state.category} videos`;

  resultSummary.textContent = state.notice
    ? state.notice
    : state.query && !showingRemote
      ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${state.query}"`
      : label;
}

function renderVideoCard(video) {
  const badge = video.live
    ? `<span class="live-badge">LIVE</span>`
    : `<span class="duration">${escapeHtml(video.duration)}</span>`;

  return `
    <button class="video-card" type="button" data-video-id="${escapeHtml(video.id)}">
      <span class="thumbnail-frame">
        <img src="${thumbnailUrl(video.id)}" alt="" loading="lazy">
        ${badge}
      </span>
      <span class="video-info">
        <span class="channel-dot ${escapeHtml(video.avatarClass)}">${escapeHtml(video.avatar)}</span>
        <span class="video-text">
          <strong class="video-title">${escapeHtml(video.title)}</strong>
          <span class="video-meta">
            <span>${escapeHtml(video.channel)}</span>
            <span>${escapeHtml(video.views)} - ${escapeHtml(video.age)}</span>
          </span>
        </span>
      </span>
    </button>
  `;
}

function renderShorts() {
  shortsGrid.innerHTML = shorts
    .map(
      (short) => `
        <button class="short-card" type="button" data-short-id="${escapeHtml(short.id)}">
          <span class="short-card__media"><img src="${thumbnailUrl(short.id)}" alt="" loading="lazy"></span>
          <strong>${escapeHtml(short.title)}</strong>
          <span>${escapeHtml(short.views)}</span>
        </button>
      `
    )
    .join("");
}

function openWatch(videoId, options = {}) {
  const { updateAddress = true } = options;
  const selected = getVideo(videoId) || videos[0];
  watchFrame.src = embedUrl(selected.id);
  watchFrame.title = selected.title;
  watchTitle.textContent = selected.title;
  watchAvatar.textContent = selected.avatar;
  watchAvatar.className = `channel-dot ${selected.avatarClass}`;
  watchChannel.textContent = selected.channel;
  watchSubscribers.textContent = selected.subscribers;
  watchDescription.textContent = selected.description;
  watchYouTubeLink.href = youtubeUrl(selected.id);
  renderUpNext(selected.id);
  watchDrawer.hidden = false;
  document.body.style.overflow = "hidden";

  if (updateAddress) {
    updateAddressVideo(selected.id);
  }
}

function closeWatch() {
  watchDrawer.hidden = true;
  watchFrame.src = "";
  document.body.style.overflow = "";
  updateAddressVideo("");
}

function renderUpNext(activeId) {
  const sourceVideos = state.remoteVideos?.some((video) => video.id === activeId) ? state.remoteVideos : videos;

  upNextList.innerHTML = sourceVideos
    .filter((video) => video.id !== activeId)
    .slice(0, 6)
    .map(
      (video) => `
        <button class="up-next-card" type="button" data-video-id="${escapeHtml(video.id)}">
          <img src="${thumbnailUrl(video.id)}" alt="" loading="lazy">
          <span>
            <strong>${escapeHtml(video.title)}</strong>
            <span>${escapeHtml(video.channel)}</span>
          </span>
        </button>
      `
    )
    .join("");
}

function shuffleVideos() {
  state.remoteVideos = null;
  state.notice = "";
  videos.sort(() => Math.random() - 0.5);
  renderVideos();
}

chipRow.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  state.category = chip.dataset.category;
  state.remoteVideos = null;
  state.notice = "";
  renderChips();
  renderVideos();
});

videoGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-video-id]");
  if (!card) return;
  openWatch(card.dataset.videoId);
});

shortsGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-short-id]");
  if (!card) return;
  openWatch(card.dataset.shortId);
});

upNextList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-video-id]");
  if (!card) return;
  openWatch(card.dataset.videoId);
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const videoId = extractYouTubeId(searchInput.value);

  if (videoId) {
    if (!getVideo(videoId)) {
      makeExternalVideo(videoId);
      hydrateExternalVideo(videoId);
    }

    openWatch(videoId);
    return;
  }

  const query = searchInput.value.trim();
  state.query = query;
  state.category = "All";
  state.notice = "";
  state.remoteVideos = null;

  if (!query) {
    renderChips();
    renderVideos();
    return;
  }

  state.loading = true;
  renderChips();
  renderVideos();

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json().catch(() => ({}));

    if (response.ok && data.enabled) {
      state.remoteVideos = data.videos || [];
      state.remoteVideos.forEach((video) => externalVideos.set(video.id, video));
    } else {
      state.notice = data.error || "In-app YouTube search is unavailable.";
    }
  } catch {
    state.notice = "In-app YouTube search is unavailable.";
  } finally {
    state.loading = false;
    renderVideos();
  }
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  state.notice = "";
  state.remoteVideos = null;
  renderVideos();
});

refreshButton.addEventListener("click", shuffleVideos);

menuButton.addEventListener("click", () => {
  sidebar.classList.toggle("is-open");
});

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close-watch]");
  if (closeButton) closeWatch();

  if (
    sidebar.classList.contains("is-open") &&
    !event.target.closest("#sidebar") &&
    !event.target.closest("#menuButton")
  ) {
    sidebar.classList.remove("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeWatch();
    sidebar.classList.remove("is-open");
  }
});

renderChips();
renderVideos();
renderShorts();

const initialVideoId = videoIdFromLocation();

if (initialVideoId) {
  if (!getVideo(initialVideoId)) {
    makeExternalVideo(initialVideoId);
    hydrateExternalVideo(initialVideoId);
  }

  openWatch(initialVideoId, { updateAddress: false });
}
