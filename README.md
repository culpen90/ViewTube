# ViewTube

A static YouTube-style client built with plain HTML, CSS, and JavaScript.

The feed is seeded with real YouTube video IDs, uses YouTube-hosted thumbnails, and plays videos through YouTube's official embedded player. Search filters the starter feed while you type, and submitting a search runs an in-app YouTube search through the included local server. Pasting a YouTube URL or 11-character video ID opens that real video directly with metadata loaded through YouTube oEmbed.

Run it through the included local server so YouTube receives the required referrer identity for embedded playback:

```bash
node server.js
```

Then open `http://127.0.0.1:4173/`.

No API key, account setup, or build step is required for the starter feed, pasted URLs, playback, or in-app YouTube search. Search results are filtered to videos YouTube reports as available in the embedded player.
