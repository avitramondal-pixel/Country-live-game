const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY;
const VIDEO_ID = process.env.YOUTUBE_VIDEO_ID;

const COMMENT_POINTS = 1;
const SUPERCHAT_POINTS = 10;

app.use(express.static("public"));

const countries = {
  India: ["india"],
  Bangladesh: ["bangladesh"],
  Pakistan: ["pakistan"],
  Nepal: ["nepal"],
  Bhutan: ["bhutan"],
  SriLanka: ["sri lanka", "srilanka"],
  China: ["china"],
  Japan: ["japan"],
  SouthKorea: ["south korea", "korea"],
  Indonesia: ["indonesia"],
  Malaysia: ["malaysia"],
  Singapore: ["singapore"],
  Thailand: ["thailand"],
  Vietnam: ["vietnam"],
  Philippines: ["philippines"],
  Australia: ["australia"],
  Canada: ["canada"],
  USA: ["usa", "united states", "america"],
  Mexico: ["mexico"],
  Brazil: ["brazil"],
  Argentina: ["argentina"],
  UK: ["uk", "united kingdom", "england"],
  France: ["france"],
  Germany: ["germany"],
  Italy: ["italy"],
  Spain: ["spain"],
  Portugal: ["portugal"],
  Netherlands: ["netherlands", "holland"],
  Russia: ["russia"],
  Turkey: ["turkey"],
  SaudiArabia: ["saudi arabia"],
  SouthAfrica: ["south africa"],
  Nigeria: ["nigeria"],
  Egypt: ["egypt"]
};

const state = {};

for (const key of Object.keys(countries)) {
  state[key] = {
    score: 0,
    latestCommenter: ""
  };
}

const processedMessages = new Set();
let liveChatId = null;
let nextPageToken = null;

function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function findCountry(text) {
  const value = normalize(text);

  for (const [country, aliases] of Object.entries(countries)) {
    if (aliases.includes(value)) {
      return country;
    }
  }

  return null;
}

async function getLiveChatId() {
  const youtube = google.youtube({
    version: "v3",
    auth: API_KEY
  });

  const response = await youtube.videos.list({
    part: "liveStreamingDetails",
    id: VIDEO_ID
  });

  const video = response.data.items?.[0];

  if (!video) {
    throw new Error("YouTube video not found.");
  }

  return video.liveStreamingDetails?.activeLiveChatId || null;
}

async function readChat() {
  try {
    if (!liveChatId) {
      liveChatId = await getLiveChatId();

      if (!liveChatId) {
        console.log("Live chat is not active yet.");
        return;
      }

      console.log("Live chat found:", liveChatId);
    }

    const youtube = google.youtube({
      version: "v3",
      auth: API_KEY
    });

    const response = await youtube.liveChatMessages.list({
      liveChatId,
      part: "id,snippet,authorDetails",
      pageToken: nextPageToken || undefined,
      maxResults: 200
    });

    nextPageToken = response.data.nextPageToken;

    for (const message of response.data.items || []) {
      if (processedMessages.has(message.id)) continue;

      processedMessages.add(message.id);

      const snippet = message.snippet || {};
      const author = message.authorDetails?.displayName || "Unknown";

      let country = null;
      let points = 0;

      if (snippet.type === "textMessageEvent") {
        country = findCountry(
          snippet.textMessageDetails?.messageText || ""
        );

        points = COMMENT_POINTS;
      }

      if (snippet.type === "superChatEvent") {
        country = findCountry(
          snippet.superChatDetails?.userComment || ""
        );

        points = SUPERCHAT_POINTS;
      }

      if (country) {
        state[country].score += points;
        state[country].latestCommenter = author;

        console.log(
          `${author} -> ${country} +${points}`
        );
      }
    }

    // Keep memory from growing forever
    if (processedMessages.size > 10000) {
      const arr = Array.from(processedMessages);
      processedMessages.clear();

      for (const id of arr.slice(-5000)) {
        processedMessages.add(id);
      }
    }

  } catch (error) {
    console.error(
      "YouTube error:",
      error.response?.data?.error?.message || error.message
    );

    // Try finding the chat again later
    liveChatId = null;
    nextPageToken = null;
  }
}

app.get("/api/state", (req, res) => {
  const leaderboard = Object.entries(state)
    .map(([country, data]) => ({
      country,
      score: data.score,
      latestCommenter: data.latestCommenter
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  res.json({
    leaderboard,
    commentPoints: COMMENT_POINTS,
    superChatPoints: SUPERCHAT_POINTS
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Country Battle running on port ${PORT}`);

  if (!API_KEY || !VIDEO_ID) {
    console.log(
      "WARNING: YOUTUBE_API_KEY or YOUTUBE_VIDEO_ID is missing."
    );
  }

  setInterval(readChat, 3000);
  readChat();
});
