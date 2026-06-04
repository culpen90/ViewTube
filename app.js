const videos = [
  {
    id: "studio-desk",
    title: "Building a creator desk that actually stays clean",
    channel: "Studio Tech",
    avatar: "ST",
    avatarClass: "violet",
    subscribers: "842K subscribers",
    views: "1.2M views",
    age: "2 days ago",
    duration: "12:48",
    category: "Tech",
    thumbnail: "assets/thumbnails/studio-desk.png",
    description:
      "A practical desk reset with monitor arms, cable routing, lighting, and storage choices for a quiet video workflow."
  },
  {
    id: "city-food",
    title: "Late-night street food crawl across five blocks",
    channel: "Recipe Mode",
    avatar: "RM",
    avatarClass: "coral",
    subscribers: "2.1M subscribers",
    views: "684K views",
    age: "5 hours ago",
    duration: "18:06",
    category: "Food",
    thumbnail: "assets/thumbnails/city-food.png",
    description:
      "A fast route through noodles, skewers, dumplings, and a dessert cart with the cooks who keep the street bright after midnight."
  },
  {
    id: "space-news",
    title: "What the latest moon mission changes about deep-space travel",
    channel: "Launch Desk",
    avatar: "LD",
    avatarClass: "sky",
    subscribers: "1.4M subscribers",
    views: "428K views",
    age: "1 day ago",
    duration: "09:31",
    category: "News",
    thumbnail: "assets/thumbnails/space-news.png",
    description:
      "A clear breakdown of mission hardware, orbital goals, and the engineering questions that come next."
  },
  {
    id: "pixel-run",
    title: "Speedrunning the neon dungeon with one health bar",
    channel: "Pixel Quest",
    avatar: "PX",
    avatarClass: "lime",
    subscribers: "517K subscribers",
    views: "2.9M views",
    age: "3 weeks ago",
    duration: "22:19",
    category: "Gaming",
    thumbnail: "assets/thumbnails/pixel-run.png",
    description:
      "A full run through the hard route with tight movement, risky skips, and a final boss pattern that has almost no margin."
  },
  {
    id: "lofi-live",
    title: "Lo-fi room beats for focused editing",
    channel: "Afterhours Audio",
    avatar: "AA",
    avatarClass: "violet",
    subscribers: "3.8M subscribers",
    views: "8.7K watching",
    age: "Live now",
    duration: "LIVE",
    category: "Music",
    thumbnail: "assets/thumbnails/lofi-live.png",
    live: true,
    description:
      "A continuous low-key set built around soft drums, mellow keys, and clean ambient texture."
  },
  {
    id: "mountain-bike",
    title: "First ride on the ridge trail after the storm",
    channel: "Trail Signal",
    avatar: "TS",
    avatarClass: "sky",
    subscribers: "305K subscribers",
    views: "312K views",
    age: "6 days ago",
    duration: "15:42",
    category: "Sports",
    thumbnail: "assets/thumbnails/mountain-bike.png",
    description:
      "Fresh dirt, repaired berms, and a full descent from the lookout to the river crossing."
  },
  {
    id: "coffee-review",
    title: "Can a compact espresso setup beat a cafe machine?",
    channel: "Bench Review",
    avatar: "BR",
    avatarClass: "coral",
    subscribers: "219K subscribers",
    views: "96K views",
    age: "12 hours ago",
    duration: "14:07",
    category: "Reviews",
    thumbnail: "assets/thumbnails/coffee-review.png",
    description:
      "A side-by-side test of grind consistency, pressure, milk texture, cleanup, and the cup you get at the end."
  },
  {
    id: "train-travel",
    title: "A window seat through the mountain pass",
    channel: "Slow Route",
    avatar: "SR",
    avatarClass: "lime",
    subscribers: "691K subscribers",
    views: "1.8M views",
    age: "1 month ago",
    duration: "31:58",
    category: "Travel",
    thumbnail: "assets/thumbnails/train-travel.png",
    description:
      "A calm rail trip through valleys, tunnels, villages, and snow lines as the afternoon light shifts."
  },
  {
    id: "frontend-build",
    title: "Rebuilding a video dashboard with plain CSS grid",
    channel: "Code Frame",
    avatar: "CF",
    avatarClass: "sky",
    subscribers: "774K subscribers",
    views: "251K views",
    age: "4 days ago",
    duration: "26:33",
    category: "Coding",
    thumbnail: "assets/thumbnails/frontend-build.png",
    description:
      "A no-framework walkthrough of responsive grids, sticky controls, accessible cards, and clean interaction state."
  },
  {
    id: "morning-market",
    title: "Inside the market before the city wakes up",
    channel: "Local Lens",
    avatar: "LL",
    avatarClass: "violet",
    subscribers: "443K subscribers",
    views: "521K views",
    age: "2 weeks ago",
    duration: "17:24",
    category: "Travel",
    thumbnail: "assets/thumbnails/morning-market.png",
    description:
      "Vendors setting up produce, fish, flowers, and breakfast counters before the first rush."
  }
];

const shorts = [
  { id: "short-editing", title: "Color grade in 20 seconds", views: "4.1M views", thumbnail: "assets/thumbnails/studio-desk.png" },
  { id: "short-noodles", title: "Hand-pulled noodles landing hot", views: "2.7M views", thumbnail: "assets/thumbnails/city-food.png" },
  { id: "short-rocket", title: "Rocket stage separation view", views: "9.3M views", thumbnail: "assets/thumbnails/space-news.png" },
  { id: "short-bike", title: "Ridge drop with perfect timing", views: "1.6M views", thumbnail: "assets/thumbnails/mountain-bike.png" },
  { id: "short-coffee", title: "Tiny espresso shot, big crema", views: "873K views", thumbnail: "assets/thumbnails/coffee-review.png" }
];

const categories = ["All", "Music", "Gaming", "News", "Live", "Coding", "Food", "Travel", "Sports", "Reviews", "Tech"];

const state = {
  category: "All",
  query: ""
};

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
const watchImage = document.querySelector("#watchImage");
const watchTitle = document.querySelector("#watchTitle");
const watchAvatar = document.querySelector("#watchAvatar");
const watchChannel = document.querySelector("#watchChannel");
const watchSubscribers = document.querySelector("#watchSubscribers");
const watchDescription = document.querySelector("#watchDescription");
const upNextList = document.querySelector("#upNextList");

function renderChips() {
  chipRow.innerHTML = categories
    .map((category) => {
      const active = category === state.category ? " is-active" : "";
      return `<button class="chip${active}" type="button" data-category="${category}">${category}</button>`;
    })
    .join("");
}

function getFilteredVideos() {
  const normalizedQuery = state.query.trim().toLowerCase();

  return videos.filter((video) => {
    const categoryMatch =
      state.category === "All" ||
      video.category === state.category ||
      (state.category === "Live" && video.live);

    const textMatch =
      !normalizedQuery ||
      [video.title, video.channel, video.category, video.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      );

    return categoryMatch && textMatch;
  });
}

function renderVideos() {
  const filtered = getFilteredVideos();

  if (filtered.length === 0) {
    videoGrid.innerHTML = `<div class="empty-state">No videos matched your search.</div>`;
  } else {
    videoGrid.innerHTML = filtered.map(renderVideoCard).join("");
  }

  const label = state.category === "All" ? "Recommended videos" : `${state.category} videos`;
  resultSummary.textContent = state.query
    ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${state.query}"`
    : label;
}

function renderVideoCard(video) {
  const badge = video.live
    ? `<span class="live-badge">LIVE</span>`
    : `<span class="duration">${video.duration}</span>`;

  return `
    <button class="video-card" type="button" data-video-id="${video.id}">
      <span class="thumbnail-frame">
        <img src="${video.thumbnail}" alt="">
        ${badge}
      </span>
      <span class="video-info">
        <span class="channel-dot ${video.avatarClass}">${video.avatar}</span>
        <span class="video-text">
          <strong class="video-title">${video.title}</strong>
          <span class="video-meta">
            <span>${video.channel}</span>
            <span>${video.views} • ${video.age}</span>
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
        <button class="short-card" type="button" data-short-id="${short.id}">
          <span class="short-card__media"><img src="${short.thumbnail}" alt=""></span>
          <strong>${short.title}</strong>
          <span>${short.views}</span>
        </button>
      `
    )
    .join("");
}

function openWatch(videoId) {
  const selected = videos.find((video) => video.id === videoId) || videos[0];
  watchImage.src = selected.thumbnail;
  watchImage.alt = "";
  watchTitle.textContent = selected.title;
  watchAvatar.textContent = selected.avatar;
  watchAvatar.className = `channel-dot ${selected.avatarClass}`;
  watchChannel.textContent = selected.channel;
  watchSubscribers.textContent = selected.subscribers;
  watchDescription.textContent = selected.description;
  renderUpNext(selected.id);
  watchDrawer.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeWatch() {
  watchDrawer.hidden = true;
  document.body.style.overflow = "";
}

function renderUpNext(activeId) {
  upNextList.innerHTML = videos
    .filter((video) => video.id !== activeId)
    .slice(0, 6)
    .map(
      (video) => `
        <button class="up-next-card" type="button" data-video-id="${video.id}">
          <img src="${video.thumbnail}" alt="">
          <span>
            <strong>${video.title}</strong>
            <span>${video.channel}</span>
          </span>
        </button>
      `
    )
    .join("");
}

function shuffleVideos() {
  videos.sort(() => Math.random() - 0.5);
  renderVideos();
}

chipRow.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  state.category = chip.dataset.category;
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
  const shortIndex = shorts.findIndex((short) => short.id === card.dataset.shortId);
  openWatch(videos[shortIndex % videos.length].id);
});

upNextList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-video-id]");
  if (!card) return;
  openWatch(card.dataset.videoId);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = searchInput.value;
  renderVideos();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
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
