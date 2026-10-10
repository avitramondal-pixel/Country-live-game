# Country Battle Live

A real-time YouTube Live Country Battle web app. Viewers type a country name
in the YouTube live chat. Each valid vote gives that country 1 point.
Super Chats give $1 = 1000 points (configurable).

## Features

- Live YouTube Data API v3 integration
- Country detection from comment text (English, ISO codes, aliases)
- Top 3 Players with real YouTube profile photos, country, $ total, points
- Top 3 Countries (gold / silver / bronze podium)
- 195 country grid with rank, flag, and points
- Live event banner
- English voice announcements (Web Speech API)
- Optional background music with auto-duck during voice
- SQLite persistence — points survive restarts
- Auto-reconnect with quota/error reporting
- Admin reset endpoint protected by token

## Folder Structure

    country-battle-live/
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── .gitignore
    ├── README.md
    ├── data/                  (auto-created)
    └── public/
        ├── index.html
        ├── style.css
        ├── script.js
        └── music/
            └── background.mp3

## Setup

### 1. Get a YouTube Data API v3 Key
1. Open https://console.cloud.google.com/
2. Create a new project.
3. Enable YouTube Data API v3.
4. Create an API key under Credentials.
5. Copy the key.

### 2. Get the Live Video ID
Copy the video ID from the YouTube live URL.

### 3. Configure
    cp .env.example .env
Fill in YOUTUBE_API_KEY, YOUTUBE_VIDEO_ID, ADMIN_TOKEN.

### 4. Add Background Music (optional)
Place a file at public/music/background.mp3.

### 5. Install & Run
    npm install
    npm start

Open http://localhost:3000

## API Endpoints

- GET  /api/state        → full state (countries, players, events)
- GET  /api/health       → health check
- POST /api/admin/reset  → reset scores (requires x-admin-token header)

## Deploy to Render

1. Push the folder to GitHub (never commit .env).
2. Create a new Web Service on Render.
3. Build Command: npm install
4. Start Command: npm start
5. Add all .env variables in Render's Environment tab.
6. Deploy.

## Notes

- Free YouTube API quota is 10,000 units/day. Each poll costs ~1 unit.
- Voice works best with English TTS voices available in most browsers.

## License

MIT
