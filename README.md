# ViewTube

A static YouTube-style client built with plain HTML, CSS, and JavaScript.

The feed is seeded with real YouTube video IDs, uses YouTube-hosted thumbnails, and plays videos through YouTube's official embedded player. Search filters the starter feed, and submitting a YouTube URL or 11-character video ID opens that real video directly with metadata loaded through YouTube oEmbed.

Run it through the included local server so YouTube receives the required referrer identity for embedded playback:

```bash
node server.js
```

Then open `http://127.0.0.1:4173/`.

No API key or build step is required for the starter feed, pasted URLs, and playback.

For in-app YouTube search, start the server with a YouTube Data API key:

```bash
YOUTUBE_API_KEY=your_key_here node server.js
```

Without a key, search still filters the verified starter feed and links out to YouTube results for broader searches.
