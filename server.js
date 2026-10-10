/* ============================================================
   COUNTRY BATTLE LIVE — SERVER
============================================================ */

require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { google } = require("googleapis");

/* ============================================================
   CONFIG
============================================================ */

const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY || "";
const VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const COMMENT_POINTS = Number(process.env.COMMENT_POINTS || 1);
const SUPERCHAT_POINTS_PER_USD = Number(process.env.SUPERCHAT_POINTS_PER_USD || 1000);
const VOICE_LANG = process.env.VOICE_LANG || "en-US";
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "battle.db");

const POLL_FALLBACK_MS = 10000;
const MAX_EVENTS_KEPT = 200;
const MAX_MESSAGES_KEPT = 10000;

/* ============================================================
   DATABASE
============================================================ */

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS country_scores (
  country_key TEXT PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  superchats INTEGER NOT NULL DEFAULT 0,
  latest_commenter TEXT DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS players (
  player_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  profile_image_url TEXT DEFAULT '',
  country_key TEXT DEFAULT '',
  country_name TEXT DEFAULT '',
  flag TEXT DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  superchats INTEGER NOT NULL DEFAULT 0,
  amount_usd REAL NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  country_key TEXT DEFAULT '',
  country_name TEXT DEFAULT '',
  flag TEXT DEFAULT '',
  display_name TEXT DEFAULT '',
  profile_image_url TEXT DEFAULT '',
  points INTEGER NOT NULL DEFAULT 0,
  message TEXT DEFAULT '',
  amount_micros INTEGER DEFAULT 0,
  amount_usd REAL DEFAULT 0,
  currency TEXT DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS processed_messages (
  message_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_country_score ON country_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_player_amount ON players(amount_usd DESC);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(created_at DESC);
`);

/* ============================================================
   COUNTRY DATA
============================================================ */

const COUNTRIES = [
  ["AF","Afghanistan"],["AL","Albania"],["DZ","Algeria"],["AD","Andorra"],
  ["AO","Angola"],["AG","Antigua and Barbuda"],["AR","Argentina"],["AM","Armenia"],
  ["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BS","Bahamas"],
  ["BH","Bahrain"],["BD","Bangladesh"],["BB","Barbados"],["BY","Belarus"],
  ["BE","Belgium"],["BZ","Belize"],["BJ","Benin"],["BT","Bhutan"],
  ["BO","Bolivia"],["BA","Bosnia and Herzegovina"],["BW","Botswana"],["BR","Brazil"],
  ["BN","Brunei"],["BG","Bulgaria"],["BF","Burkina Faso"],["BI","Burundi"],
  ["CV","Cabo Verde"],["KH","Cambodia"],["CM","Cameroon"],["CA","Canada"],
  ["CF","Central African Republic"],["TD","Chad"],["CL","Chile"],["CN","China"],
  ["CO","Colombia"],["KM","Comoros"],["CG","Congo"],["CD","Democratic Republic of the Congo"],
  ["CR","Costa Rica"],["CI","Cote d'Ivoire"],["HR","Croatia"],["CU","Cuba"],
  ["CY","Cyprus"],["CZ","Czechia"],["DK","Denmark"],["DJ","Djibouti"],
  ["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["EG","Egypt"],
  ["SV","El Salvador"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["EE","Estonia"],
  ["SZ","Eswatini"],["ET","Ethiopia"],["FJ","Fiji"],["FI","Finland"],
  ["FR","France"],["GA","Gabon"],["GM","Gambia"],["GE","Georgia"],
  ["DE","Germany"],["GH","Ghana"],["GR","Greece"],["GD","Grenada"],
  ["GT","Guatemala"],["GN","Guinea"],["GW","Guinea-Bissau"],["GY","Guyana"],
  ["HT","Haiti"],["HN","Honduras"],["HU","Hungary"],["IS","Iceland"],
  ["IN","India"],["ID","Indonesia"],["IR","Iran"],["IQ","Iraq"],
  ["IE","Ireland"],["IL","Israel"],["IT","Italy"],["JM","Jamaica"],
  ["JP","Japan"],["JO","Jordan"],["KZ","Kazakhstan"],["KE","Kenya"],
  ["KI","Kiribati"],["KP","North Korea"],["KR","South Korea"],["KW","Kuwait"],
  ["KG","Kyrgyzstan"],["LA","Laos"],["LV","Latvia"],["LB","Lebanon"],
  ["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["LI","Liechtenstein"],
  ["LT","Lithuania"],["LU","Luxembourg"],["MG","Madagascar"],["MW","Malawi"],
  ["MY","Malaysia"],["MV","Maldives"],["ML","Mali"],["MT","Malta"],
  ["MH","Marshall Islands"],["MR","Mauritania"],["MU","Mauritius"],["MX","Mexico"],
  ["FM","Micronesia"],["MD","Moldova"],["MC","Monaco"],["MN","Mongolia"],
  ["ME","Montenegro"],["MA","Morocco"],["MZ","Mozambique"],["MM","Myanmar"],
  ["NA","Namibia"],["NR","Nauru"],["NP","Nepal"],["NL","Netherlands"],
  ["NZ","New Zealand"],["NI","Nicaragua"],["NE","Niger"],["NG","Nigeria"],
  ["MK","North Macedonia"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],
  ["PW","Palau"],["PS","Palestine"],["PA","Panama"],["PG","Papua New Guinea"],
  ["PY","Paraguay"],["PE","Peru"],["PH","Philippines"],["PL","Poland"],
  ["PT","Portugal"],["QA","Qatar"],["RO","Romania"],["RU","Russia"],
  ["RW","Rwanda"],["KN","Saint Kitts and Nevis"],["LC","Saint Lucia"],
  ["VC","Saint Vincent and the Grenadines"],["WS","Samoa"],["SM","San Marino"],
  ["ST","Sao Tome and Principe"],["SA","Saudi Arabia"],["SN","Senegal"],["RS","Serbia"],
  ["SC","Seychelles"],["SL","Sierra Leone"],["SG","Singapore"],["SK","Slovakia"],
  ["SI","Slovenia"],["SB","Solomon Islands"],["SO","Somalia"],["ZA","South Africa"],
  ["SS","South Sudan"],["ES","Spain"],["LK","Sri Lanka"],["SD","Sudan"],
  ["SR","Suriname"],["SE","Sweden"],["CH","Switzerland"],["SY","Syria"],
  ["TJ","Tajikistan"],["TZ","Tanzania"],["TH","Thailand"],["TL","Timor-Leste"],
  ["TG","Togo"],["TO","Tonga"],["TT","Trinidad and Tobago"],["TN","Tunisia"],
  ["TR","Türkiye"],["TM","Turkmenistan"],["TV","Tuvalu"],["UG","Uganda"],
  ["UA","Ukraine"],["AE","United Arab Emirates"],["GB","United Kingdom"],["US","United States"],
  ["UY","Uruguay"],["UZ","Uzbekistan"],["VU","Vanuatu"],["VA","Holy See"],
  ["VE","Venezuela"],["VN","Vietnam"],["YE","Yemen"],["ZM","Zambia"],
  ["ZW","Zimbabwe"]
];

const ALIASES = {
  "usa":"United States","us":"United States","america":"United States",
  "united states of america":"United States","united states":"United States",
  "uk":"United Kingdom","britain":"United Kingdom","great britain":"United Kingdom",
  "england":"United Kingdom","scotland":"United Kingdom","wales":"United Kingdom",
  "uae":"United Arab Emirates","dubai":"United Arab Emirates",
  "korea":"South Korea","south korea":"South Korea","republic of korea":"South Korea",
  "north korea":"North Korea","dprk":"North Korea",
  "turkey":"Türkiye","turkiye":"Türkiye","türkiye":"Türkiye",
  "czech republic":"Czechia","czech":"Czechia",
  "burma":"Myanmar","ivory coast":"Cote d'Ivoire","cote d ivoire":"Cote d'Ivoire",
  "cabo verde":"Cabo Verde","cape verde":"Cabo Verde",
  "vatican":"Holy See","vatican city":"Holy See","holy see":"Holy See",
  "swaziland":"Eswatini","macedonia":"North Macedonia",
  "persia":"Iran","holland":"Netherlands","the netherlands":"Netherlands",
  "dr congo":"Democratic Republic of the Congo","drc":"Democratic Republic of the Congo",
  "republic of congo":"Congo","republic of the congo":"Congo",
  "bangla":"Bangladesh","bharat":"India","hindustan":"India",
  "south sudan":"South Sudan","sudan":"Sudan",
  "saudi arabia":"Saudi Arabia","ksa":"Saudi Arabia",
  "bosnia":"Bosnia and Herzegovina","bosnia and herzegovina":"Bosnia and Herzegovina",
  "trinidad":"Trinidad and Tobago","tobago":"Trinidad and Tobago",
  "st kitts":"Saint Kitts and Nevis","st lucia":"Saint Lucia",
  "st vincent":"Saint Vincent and the Grenadines",
  "sao tome":"Sao Tome and Principe"
};

/* ============================================================
   FLAG HELPER
============================================================ */

function codeToFlag(code){
  let out = "";
  const up = String(code || "").toUpperCase();
  for(let i = 0; i < up.length; i++){
    out += String.fromCodePoint(127397 + up.charCodeAt(i));
  }
  return out;
}

/* ============================================================
   BUILD SEARCH INDEX
============================================================ */

const COUNTRY_BY_KEY = {};
const SEARCH_TERMS = [];

function makeKey(name){
  return name.replace(/[^a-zA-Z0-9]+/g, "");
}

for(const [code, name] of COUNTRIES){
  const key = makeKey(name);
  COUNTRY_BY_KEY[key] = { code, name, flag: codeToFlag(code) };
  SEARCH_TERMS.push({ key, term: name.toLowerCase(), len: name.length });
}

for(const alias in ALIASES){
  const canonical = ALIASES[alias];
  const key = makeKey(canonical);
  if(!COUNTRY_BY_KEY[key]) continue;
  SEARCH_TERMS.push({ key, term: alias.toLowerCase(), len: alias.length });
}

SEARCH_TERMS.sort((a, b) => b.len - a.len);

/* ============================================================
   NORMALIZE
============================================================ */

function normalize(text){
  return String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/* ============================================================
   DETECT COUNTRY
============================================================ */

function detectCountry(message){
  const text = normalize(message);
  if(!text) return null;

  for(const item of SEARCH_TERMS){
    const term = item.term;
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("(^|\\s)" + esc + "(?=\\s|$)", "i");
    if(re.test(text)) return item.key;
  }
  return null;
}

/* ============================================================
   EXCHANGE RATES
============================================================ */

const FX_TO_USD = {
  USD: 1, EUR: 1.08, GBP: 1.27, JPY: 0.0067, KRW: 0.00075,
  INR: 0.012, BDT: 0.0091, PKR: 0.0036, AUD: 0.66, CAD: 0.73,
  CHF: 1.13, CNY: 0.14, HKD: 0.128, SGD: 0.74, MYR: 0.22,
  THB: 0.028, IDR: 0.000063, PHP: 0.017, VND: 0.00004,
  BRL: 0.18, MXN: 0.058, RUB: 0.011, TRY: 0.029, ZAR: 0.054,
  AED: 0.27, SAR: 0.27, EGP: 0.021, NGN: 0.00065, KES: 0.0077,
  NZD: 0.60, SEK: 0.094, NOK: 0.091, DKK: 0.145, PLN: 0.25,
  CZK: 0.043, HUF: 0.0028, RON: 0.22, ILS: 0.27, TWD: 0.031,
  ARS: 0.0011, CLP: 0.0010, COP: 0.00025, PEN: 0.27,
  UAH: 0.024, LKR: 0.0034, NPR: 0.0075, AFN: 0.014
};

function toUSD(amountMicros, currency){
  const cur = String(currency || "USD").toUpperCase();
  const rate = FX_TO_USD[cur] != null ? FX_TO_USD[cur] : 1;
  return (Number(amountMicros || 0) / 1e6) * rate;
}

/* ============================================================
   EXPRESS
============================================================ */

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ============================================================
   YOUTUBE CLIENT
============================================================ */

const youtube = google.youtube({ version: "v3", auth: API_KEY });

/* ============================================================
   STATE
============================================================ */

let liveChatId = null;
let nextPageToken = null;
let pollingTimer = null;
let lastPollAt = 0;
let lastError = "";
const seenMessageIds = new Set();

(function loadSeenMessages(){
  try{
    const rows = db.prepare("SELECT message_id FROM processed_messages ORDER BY created_at DESC LIMIT ?")
      .all(MAX_MESSAGES_KEPT);
    for(const r of rows) seenMessageIds.add(r.message_id);
    console.log("Loaded " + seenMessageIds.size + " processed message IDs");
  }catch(e){
    console.error("loadSeenMessages:", e.message);
  }
})();

/* ============================================================
   DB WRITES
============================================================ */

const stmtUpsertCountry = db.prepare(`
INSERT INTO country_scores (country_key, score, comments, superchats, latest_commenter, updated_at)
VALUES (@k, @score, @comments, @sc, @lc, @now)
ON CONFLICT(country_key) DO UPDATE SET
  score = score + @score,
  comments = comments + @comments,
  superchats = superchats + @sc,
  latest_commenter = CASE WHEN @lc <> '' THEN @lc ELSE latest_commenter END,
  updated_at = @now
`);

const stmtUpsertPlayer = db.prepare(`
INSERT INTO players (player_key, display_name, profile_image_url, country_key, country_name, flag, score, comments, superchats, amount_usd, updated_at)
VALUES (@pk, @dn, @img, @ck, @cn, @fl, @score, @comments, @sc, @amt, @now)
ON CONFLICT(player_key) DO UPDATE SET
  display_name = @dn,
  profile_image_url = CASE WHEN @img <> '' THEN @img ELSE profile_image_url END,
  country_key = CASE WHEN @ck <> '' THEN @ck ELSE country_key END,
  country_name = CASE WHEN @cn <> '' THEN @cn ELSE country_name END,
  flag = CASE WHEN @fl <> '' THEN @fl ELSE flag END,
  score = score + @score,
  comments = comments + @comments,
  superchats = superchats + @sc,
  amount_usd = amount_usd + @amt,
  updated_at = @now
`);

const stmtInsertEvent = db.prepare(`
INSERT OR IGNORE INTO events (id, type, country_key, country_name, flag, display_name, profile_image_url, points, message, amount_micros, amount_usd, currency, created_at)
VALUES (@id, @type, @ck, @cn, @fl, @dn, @img, @pts, @msg, @micros, @usd, @cur, @now)
`);

const stmtInsertProcessed = db.prepare(`
INSERT OR IGNORE INTO processed_messages (message_id, created_at) VALUES (?, ?)
`);

const stmtTrimEvents = db.prepare(`
DELETE FROM events WHERE id NOT IN (
  SELECT id FROM events ORDER BY created_at DESC LIMIT ?
)
`);

const stmtTrimProcessed = db.prepare(`
DELETE FROM processed_messages WHERE message_id NOT IN (
  SELECT message_id FROM processed_messages ORDER BY created_at DESC LIMIT ?
)
`);

/* ============================================================
   EVENT LOG
============================================================ */

function recordEvent(ev){
  try{
    stmtInsertEvent.run({
      id: ev.id,
      type: ev.type,
      ck: ev.country || "",
      cn: ev.countryName || "",
      fl: ev.flag || "",
      dn: ev.displayName || "",
      img: ev.profileImageUrl || "",
      pts: ev.points || 0,
      msg: (ev.message || "").slice(0, 500),
      micros: ev.amountMicros || 0,
      usd: ev.amount || 0,
      cur: ev.currency || "",
      now: Date.now()
    });
    stmtTrimEvents.run(MAX_EVENTS_KEPT);
  }catch(e){
    console.error("recordEvent:", e.message);
  }
}

/* ============================================================
   PROCESS YOUTUBE MESSAGE
============================================================ */

function processMessage(item){
  try{
    if(!item || !item.id) return;
    if(seenMessageIds.has(item.id)) return;

    seenMessageIds.add(item.id);
    stmtInsertProcessed.run(item.id, Date.now());

    const snippet = item.snippet || {};
    const author = item.authorDetails || {};
    const displayName = author.displayName || "Anonymous";
    const profileImageUrl = author.profileImageUrl || "";
    const type = snippet.type || "";

    let message = "";
    let amountMicros = 0;
    let currency = "";

    if(type === "textMessageEvent"){
      message = snippet.displayMessage ||
        (snippet.textMessageDetails && snippet.textMessageDetails.messageText) || "";
    } else if(type === "superChatEvent"){
      const d = snippet.superChatDetails || {};
      message = d.userComment || "";
      amountMicros = Number(d.amountMicros || 0);
      currency = d.currency || "USD";
    } else if(type === "superStickerEvent"){
      const d = snippet.superStickerDetails || {};
      message = "";
      amountMicros = Number(d.amountMicros || 0);
      currency = d.currency || "USD";
    } else {
      return;
    }

    const countryKey = detectCountry(message);

    if(!countryKey){
      recordEvent({
        id: item.id,
        type: type === "textMessageEvent" ? "comment" : "superchat",
        country: "", countryName: "", flag: "",
        displayName: displayName, profileImageUrl: profileImageUrl,
        points: 0, message: message,
        amountMicros: amountMicros,
        amount: toUSD(amountMicros, currency),
        currency: currency
      });
      return;
    }

    const info = COUNTRY_BY_KEY[countryKey];
    if(!info) return;

    const now = Date.now();

    if(type === "textMessageEvent"){
      const points = COMMENT_POINTS;

      stmtUpsertCountry.run({
        k: countryKey, score: points, comments: 1, sc: 0,
        lc: displayName, now: now
      });

      stmtUpsertPlayer.run({
        pk: displayName.toLowerCase(),
        dn: displayName,
        img: profileImageUrl,
        ck: countryKey,
        cn: info.name,
        fl: info.flag,
        score: points,
        comments: 1,
        sc: 0,
        amt: 0,
        now: now
      });

      recordEvent({
        id: item.id,
        type: "comment",
        country: countryKey,
        countryName: info.name,
        flag: info.flag,
        displayName: displayName,
        profileImageUrl: profileImageUrl,
        points: points,
        message: message,
        amountMicros: 0,
        amount: 0,
        currency: ""
      });

      console.log("COMMENT +" + points + " | " + displayName + " | " + info.name);
      return;
    }

    if(type === "superChatEvent" || type === "superStickerEvent"){
      const usd = toUSD(amountMicros, currency);
      let points = Math.round(usd * SUPERCHAT_POINTS_PER_USD);
      if(points < 1) points = 1;

      stmtUpsertCountry.run({
        k: countryKey, score: points, comments: 0, sc: 1,
        lc: displayName, now: now
      });

      stmtUpsertPlayer.run({
        pk: displayName.toLowerCase(),
        dn: displayName,
        img: profileImageUrl,
        ck: countryKey,
        cn: info.name,
        fl: info.flag,
        score: points,
        comments: 0,
        sc: 1,
        amt: usd,
        now: now
      });

      recordEvent({
        id: item.id,
        type: "superchat",
        country: countryKey,
        countryName: info.name,
        flag: info.flag,
        displayName: displayName,
        profileImageUrl: profileImageUrl,
        points: points,
        message: message,
        amountMicros: amountMicros,
        amount: usd,
        currency: currency
      });

      console.log("SUPER CHAT +" + points + " | " + displayName + " | " + info.name + " | " + usd.toFixed(2) + " USD");
    }
  }catch(e){
    console.error("processMessage:", e.message);
  }
}

/* ============================================================
   YOUTUBE POLLING
============================================================ */

async function getLiveChatId(){
  if(!API_KEY) throw new Error("YOUTUBE_API_KEY missing");
  if(!VIDEO_ID) throw new Error("YOUTUBE_VIDEO_ID missing");

  const res = await youtube.videos.list({
    part: ["liveStreamingDetails"],
    id: [VIDEO_ID]
  });

  const item = res.data.items && res.data.items[0];
  if(!item) throw new Error("Video not found: " + VIDEO_ID);

  const details = item.liveStreamingDetails;
  if(!details) throw new Error("Not a live stream.");

  liveChatId = details.activeLiveChatId || null;
  if(!liveChatId) throw new Error("Live chat not active.");

  nextPageToken = null;
  console.log("LIVE CHAT CONNECTED: " + liveChatId);
  return liveChatId;
}

async function pollChat(){
  try{
    if(!liveChatId) await getLiveChatId();

    const params = {
      liveChatId: liveChatId,
      part: ["snippet", "authorDetails"],
      maxResults: 200
    };
    if(nextPageToken) params.pageToken = nextPageToken;

    const res = await youtube.liveChatMessages.list(params);
    nextPageToken = res.data.nextPageToken || null;
    lastPollAt = Date.now();
    lastError = "";

    const items = res.data.items || [];
    if(items.length) console.log("YouTube messages received: " + items.length);

    for(const item of items) processMessage(item);

    stmtTrimProcessed.run(MAX_MESSAGES_KEPT);

    const wait = res.data.pollingIntervalMillis || 5000;
    schedulePoll(Math.max(1500, wait));
  }catch(err){
    const data = err.response && err.response.data;
    lastError = data ? JSON.stringify(data).slice(0, 500) : err.message;
    console.error("YOUTUBE ERROR:", lastError);

    liveChatId = null;
    nextPageToken = null;
    schedulePoll(POLL_FALLBACK_MS);
  }
}

function schedulePoll(delay){
  if(pollingTimer) clearTimeout(pollingTimer);
  pollingTimer = setTimeout(pollChat, Math.max(1000, Number(delay) || 5000));
}

/* ============================================================
   API HELPERS
============================================================ */

function buildCountryList(){
  const rows = db.prepare("SELECT country_key, score, comments, superchats, latest_commenter FROM country_scores").all();
  const map = {};
  for(const r of rows) map[r.country_key] = r;

  const list = COUNTRIES.map(([code, name]) => {
    const key = makeKey(name);
    const r = map[key] || { score: 0, comments: 0, superchats: 0, latest_commenter: "" };
    return {
      country: key,
      countryName: name,
      flag: codeToFlag(code),
      score: r.score || 0,
      commentCount: r.comments || 0,
      superChats: r.superchats || 0,
      latestCommenter: r.latest_commenter || ""
    };
  });

  list.sort((a, b) => {
    if(b.score !== a.score) return b.score - a.score;
    return a.countryName.localeCompare(b.countryName);
  });
  return list;
}

function buildPlayerList(){
  const rows = db.prepare(`
    SELECT player_key, display_name, profile_image_url, country_key, country_name, flag,
           score, comments, superchats, amount_usd
    FROM players
    WHERE score > 0 OR amount_usd > 0
    ORDER BY amount_usd DESC, score DESC
    LIMIT 500
  `).all();

  return rows.map(r => ({
    key: r.player_key,
    displayName: r.display_name,
    profileImageUrl: r.profile_image_url,
    country: r.country_key,
    countryName: r.country_name,
    flag: r.flag,
    score: r.score,
    comments: r.comments,
    superChats: r.superchats,
    amount: r.amount_usd
  }));
}

function buildEvents(){
  const rows = db.prepare(`
    SELECT id, type, country_key, country_name, flag, display_name, profile_image_url,
           points, message, amount_micros, amount_usd, currency, created_at
    FROM events
    ORDER BY created_at DESC
    LIMIT 30
  `).all();

  return rows.map(r => ({
    id: r.id,
    type: r.type,
    country: r.country_key,
    countryName: r.country_name,
    flag: r.flag,
    displayName: r.display_name,
    profileImageUrl: r.profile_image_url,
    points: r.points,
    message: r.message,
    amountMicros: r.amount_micros,
    amount: r.amount_usd,
    currency: r.currency,
    time: r.created_at
  }));
}

/* ============================================================
   API ROUTES
============================================================ */

app.get("/api/state", (req, res) => {
  try{
    const countries = buildCountryList();
    const players = buildPlayerList();
    const events = buildEvents();

    const topPlayers = players.slice(0, 3);
    const topCountries = countries.filter(c => c.score > 0).slice(0, 3);

    res.json({
      connected: Boolean(liveChatId),
      videoId: VIDEO_ID,
      commentPoints: COMMENT_POINTS,
      superChatPointsPerUsd: SUPERCHAT_POINTS_PER_USD,
      voiceLang: VOICE_LANG,
      countries: countries,
      players: players,
      topPlayers: topPlayers,
      topCountries: topCountries,
      events: events,
      lastEvent: events.length ? events[0] : null,
      lastPollAt: lastPollAt,
      lastError: lastError,
      totalEvents: events.length,
      totalPlayers: players.length,
      uptimeSeconds: Math.floor(process.uptime())
    });
  }catch(e){
    console.error("GET /api/state:", e.message);
    res.status(500).json({ error: "state_failed", message: e.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    connected: Boolean(liveChatId),
    videoId: VIDEO_ID,
    hasApiKey: Boolean(API_KEY),
    lastPollAt: lastPollAt,
    lastError: lastError,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.post("/api/admin/reset", (req, res) => {
  const token = req.headers["x-admin-token"] || (req.body && req.body.token);
  if(!ADMIN_TOKEN){
    return res.status(500).json({ error: "admin_token_not_configured" });
  }
  if(token !== ADMIN_TOKEN){
    return res.status(401).json({ error: "unauthorized" });
  }

  try{
    db.exec(`
      DELETE FROM country_scores;
      DELETE FROM players;
      DELETE FROM events;
      DELETE FROM processed_messages;
    `);
    seenMessageIds.clear();
    console.log("ADMIN RESET executed at " + new Date().toISOString());
    res.json({ ok: true, resetAt: Date.now() });
  }catch(e){
    res.status(500).json({ error: "reset_failed", message: e.message });
  }
});

/* ============================================================
   START
============================================================ */

app.listen(PORT, () => {
  console.log("=============================================");
  console.log("  COUNTRY BATTLE LIVE — SERVER");
  console.log("=============================================");
  console.log("Port        : " + PORT);
  console.log("Video ID    : " + (VIDEO_ID || "(not set)"));
  console.log("API key     : " + (API_KEY ? "set" : "MISSING"));
  console.log("Comment pts : " + COMMENT_POINTS);
  console.log("SC per USD  : " + SUPERCHAT_POINTS_PER_USD);
  console.log("Voice lang  : " + VOICE_LANG);
  console.log("=============================================");

  if(!API_KEY) console.error("ERROR: YOUTUBE_API_KEY missing in .env");
  if(!VIDEO_ID) console.error("ERROR: YOUTUBE_VIDEO_ID missing in .env");

  pollChat();
});

/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */

function shutdown(sig){
  console.log("Shutting down (" + sig + ")...");
  if(pollingTimer) clearTimeout(pollingTimer);
  try { db.close(); } catch(e){}
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
