/* ============================================================
   COUNTRY BATTLE LIVE — SERVER (JSON storage, no native deps)
============================================================ */

require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
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
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "battle.json");

const POLL_FALLBACK_MS = 10000;
const MAX_EVENTS_KEPT = 200;
const MAX_MESSAGES_KEPT = 10000;

/* ============================================================
   JSON STORAGE
============================================================ */

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let store = {
  country_scores: {},   // key → { score, comments, superchats, latest_commenter }
  players: {},          // key → { displayName, profileImageUrl, country, countryName, flag, score, comments, superChats, amount }
  events: [],           // array of event objects (newest first)
  processed: {},        // message_id → timestamp
};

function loadStore(){
  try{
    if(fs.existsSync(DB_PATH)){
      const raw = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(raw);
      store.country_scores = parsed.country_scores || {};
      store.players = parsed.players || {};
      store.events = parsed.events || [];
      store.processed = parsed.processed || {};
      console.log("Loaded storage: " +
        Object.keys(store.country_scores).length + " countries, " +
        Object.keys(store.players).length + " players, " +
        store.events.length + " events, " +
        Object.keys(store.processed).length + " processed IDs");
    } else {
      console.log("No existing storage file — starting fresh");
    }
  }catch(e){
    console.error("loadStore error:", e.message);
  }
}

let saveScheduled = false;
function saveStore(){
  if(saveScheduled) return;
  saveScheduled = true;
  setTimeout(function(){
    saveScheduled = false;
    try{
      /* Trim processed to last MAX_MESSAGES_KEPT */
      const ids = Object.keys(store.processed);
      if(ids.length > MAX_MESSAGES_KEPT){
        ids.sort(function(a, b){ return store.processed[a] - store.processed[b]; });
        const toRemove = ids.slice(0, ids.length - MAX_MESSAGES_KEPT);
        for(const id of toRemove) delete store.processed[id];
      }

      /* Trim events */
      if(store.events.length > MAX_EVENTS_KEPT){
        store.events = store.events.slice(0, MAX_EVENTS_KEPT);
      }

      fs.writeFileSync(DB_PATH, JSON.stringify(store), "utf8");
    }catch(e){
      console.error("saveStore error:", e.message);
    }
  }, 500);
}

loadStore();

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
   NORMALIZE + DETECT
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

function detectCountry(message){
  const text = normalize(message);
  if(!text) return null;

  for(const item of SEARCH_TERMS){
    const term = item.term;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("(^|\\s)" + escaped + "(?=\\s|$)", "i");
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

/* ============================================================
   UPSERT HELPERS
============================================================ */

function upsertCountry(key, points, isComment, isSuperChat, latestCommenter){
  if(!store.country_scores[key]){
    store.country_scores[key] = {
      score: 0, comments: 0, superchats: 0, latest_commenter: ""
    };
  }
  const c = store.country_scores[key];
  c.score += points;
  if(isComment) c.comments += 1;
  if(isSuperChat) c.superchats += 1;
  if(latestCommenter) c.latest_commenter = latestCommenter;
}

function upsertPlayer(displayName, profileImageUrl, countryKey, countryName, flag, points, isComment, isSuperChat, usd){
  const key = String(displayName || "anonymous").toLowerCase();

  if(!store.players[key]){
    store.players[key] = {
      displayName: displayName || "Anonymous",
      profileImageUrl: "",
      country: "",
      countryName: "",
      flag: "",
      score: 0,
      comments: 0,
      superChats: 0,
      amount: 0
    };
  }

  const p = store.players[key];
  p.displayName = displayName || p.displayName;
  if(profileImageUrl) p.profileImageUrl = profileImageUrl;
  if(countryKey){
    p.country = countryKey;
    p.countryName = countryName;
    p.flag = flag;
  }
  p.score += points;
  if(isComment) p.comments += 1;
  if(isSuperChat) p.superChats += 1;
  if(usd) p.amount += usd;
}

function recordEvent(ev){
  store.events.unshift(ev);
  if(store.events.length > MAX_EVENTS_KEPT){
    store.events = store.events.slice(0, MAX_EVENTS_KEPT);
  }
}

/* ============================================================
   PROCESS MESSAGE
============================================================ */

function processMessage(item){
  try{
    if(!item || !item.id) return;
    if(store.processed[item.id]) return;

    store.processed[item.id] = Date.now();

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
        currency: currency,
        time: Date.now()
      });
      saveStore();
      return;
    }

    const info = COUNTRY_BY_KEY[countryKey];
    if(!info) return;

    if(type === "textMessageEvent"){
      const points = COMMENT_POINTS;

      upsertCountry(countryKey, points, true, false, displayName);
      upsertPlayer(displayName, profileImageUrl, countryKey, info.name, info.flag, points, true, false, 0);

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
        currency: "",
        time: Date.now()
      });

      console.log("COMMENT +" + points + " | " + displayName + " | " + info.name);
      saveStore();
      return;
    }

    if(type === "superChatEvent" || type === "superStickerEvent"){
      const usd = toUSD(amountMicros, currency);
      let points = Math.round(usd * SUPERCHAT_POINTS_PER_USD);
      if(points < 1) points = 1;

      upsertCountry(countryKey, points, false, true, displayName);
      upsertPlayer(displayName, profileImageUrl, countryKey, info.name, info.flag, points, false, true, usd);

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
        currency: currency,
        time: Date.now()
      });

      console.log("SUPER CHAT +" + points + " | " + displayName + " | " + info.name + " | " + usd.toFixed(2) + " USD");
      saveStore();
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
  const list = COUNTRIES.map(function(entry){
    const code = entry[0];
    const name = entry[1];
    const key = makeKey(name);
    const r = store.country_scores[key] || { score: 0, comments: 0, superchats: 0, latest_commenter: "" };
    return {
      country: key,
      countryName: name,
      flag: codeToFlag(code),
      score: r.score || 0,
      commentCount: r.comments || 0,
      superChats: r.superchats || 0,
      latestCommenter
