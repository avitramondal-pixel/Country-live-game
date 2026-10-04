const express = require("express");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const API_KEY = process.env.YOUTUBE_API_KEY;

const VIDEO_ID =
  process.env.YOUTUBE_VIDEO_ID || "3PEzpCJjYFE";

const COMMENT_POINTS = 1;

const SUPERCHAT_POINTS_PER_USD =
  Number(process.env.SUPERCHAT_POINTS_PER_USD || 1000);

const POLL_FALLBACK_MS = 10000;

const MAX_EVENTS = 500;

const MAX_SEEN_MESSAGES = 5000;


/* =====================================================
   EXPRESS
===================================================== */

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


/* =====================================================
   YOUTUBE API
===================================================== */

if (!API_KEY) {
  console.error(
    "ERROR: YOUTUBE_API_KEY is missing in .env"
  );
}

const youtube = google.youtube({
  version: "v3",
  auth: API_KEY
});


/* =====================================================
   COUNTRY DATA - 195
===================================================== */

const countryData = [

  ["AF","Afghanistan"],
  ["AL","Albania"],
  ["DZ","Algeria"],
  ["AD","Andorra"],
  ["AO","Angola"],
  ["AG","Antigua and Barbuda"],
  ["AR","Argentina"],
  ["AM","Armenia"],
  ["AU","Australia"],
  ["AT","Austria"],
  ["AZ","Azerbaijan"],

  ["BS","Bahamas"],
  ["BH","Bahrain"],
  ["BD","Bangladesh"],
  ["BB","Barbados"],
  ["BY","Belarus"],
  ["BE","Belgium"],
  ["BZ","Belize"],
  ["BJ","Benin"],
  ["BT","Bhutan"],
  ["BO","Bolivia"],
  ["BA","Bosnia and Herzegovina"],
  ["BW","Botswana"],
  ["BR","Brazil"],
  ["BN","Brunei"],
  ["BG","Bulgaria"],
  ["BF","Burkina Faso"],
  ["BI","Burundi"],

  ["CV","Cape Verde"],
  ["KH","Cambodia"],
  ["CM","Cameroon"],
  ["CA","Canada"],
  ["CF","Central African Republic"],
  ["TD","Chad"],
  ["CL","Chile"],
  ["CN","China"],
  ["CO","Colombia"],
  ["KM","Comoros"],
  ["CG","Congo"],
  ["CD","Democratic Republic of the Congo"],
  ["CR","Costa Rica"],
  ["CI","Cote d'Ivoire"],
  ["HR","Croatia"],
  ["CU","Cuba"],
  ["CY","Cyprus"],
  ["CZ","Czechia"],

  ["DK","Denmark"],
  ["DJ","Djibouti"],
  ["DM","Dominica"],
  ["DO","Dominican Republic"],

  ["EC","Ecuador"],
  ["EG","Egypt"],
  ["SV","El Salvador"],
  ["GQ","Equatorial Guinea"],
  ["ER","Eritrea"],
  ["EE","Estonia"],
  ["SZ","Eswatini"],
  ["ET","Ethiopia"],

  ["FJ","Fiji"],
  ["FI","Finland"],
  ["FR","France"],

  ["GA","Gabon"],
  ["GM","Gambia"],
  ["GE","Georgia"],
  ["DE","Germany"],
  ["GH","Ghana"],
  ["GR","Greece"],
  ["GD","Grenada"],
  ["GT","Guatemala"],
  ["GN","Guinea"],
  ["GW","Guinea-Bissau"],
  ["GY","Guyana"],

  ["HT","Haiti"],
  ["HN","Honduras"],
  ["HU","Hungary"],

  ["IS","Iceland"],
  ["IN","India"],
  ["ID","Indonesia"],
  ["IR","Iran"],
  ["IQ","Iraq"],
  ["IE","Ireland"],
  ["IL","Israel"],
  ["IT","Italy"],

  ["JM","Jamaica"],
  ["JP","Japan"],
  ["JO","Jordan"],

  ["KZ","Kazakhstan"],
  ["KE","Kenya"],
  ["KI","Kiribati"],
  ["KW","Kuwait"],
  ["KG","Kyrgyzstan"],

  ["LA","Laos"],
  ["LV","Latvia"],
  ["LB","Lebanon"],
  ["LS","Lesotho"],
  ["LR","Liberia"],
  ["LY","Libya"],
  ["LI","Liechtenstein"],
  ["LT","Lithuania"],
  ["LU","Luxembourg"],

  ["MG","Madagascar"],
  ["MW","Malawi"],
  ["MY","Malaysia"],
  ["MV","Maldives"],
  ["ML","Mali"],
  ["MT","Malta"],
  ["MH","Marshall Islands"],
  ["MR","Mauritania"],
  ["MU","Mauritius"],
  ["MX","Mexico"],
  ["FM","Micronesia"],
  ["MD","Moldova"],
  ["MC","Monaco"],
  ["MN","Mongolia"],
  ["ME","Montenegro"],
  ["MA","Morocco"],
  ["MZ","Mozambique"],
  ["MM","Myanmar"],

  ["NA","Namibia"],
  ["NR","Nauru"],
  ["NP","Nepal"],
  ["NL","Netherlands"],
  ["NZ","New Zealand"],
  ["NI","Nicaragua"],
  ["NE","Niger"],
  ["NG","Nigeria"],
  ["KP","North Korea"],
  ["MK","North Macedonia"],
  ["NO","Norway"],

  ["OM","Oman"],

  ["PK","Pakistan"],
  ["PW","Palau"],
  ["PS","Palestine"],
  ["PA","Panama"],
  ["PG","Papua New Guinea"],
  ["PY","Paraguay"],
  ["PE","Peru"],
  ["PH","Philippines"],
  ["PL","Poland"],
  ["PT","Portugal"],

  ["QA","Qatar"],

  ["RO","Romania"],
  ["RU","Russia"],
  ["RW","Rwanda"],

  ["KN","Saint Kitts and Nevis"],
  ["LC","Saint Lucia"],
  ["VC","Saint Vincent and the Grenadines"],
  ["WS","Samoa"],
  ["SM","San Marino"],
  ["ST","Sao Tome and Principe"],
  ["SA","Saudi Arabia"],
  ["SN","Senegal"],
  ["RS","Serbia"],
  ["SC","Seychelles"],
  ["SL","Sierra Leone"],
  ["SG","Singapore"],
  ["SK","Slovakia"],
  ["SI","Slovenia"],
  ["SB","Solomon Islands"],
  ["SO","Somalia"],
  ["ZA","South Africa"],
  ["KR","South Korea"],
  ["SS","South Sudan"],
  ["ES","Spain"],
  ["LK","Sri Lanka"],
  ["SD","Sudan"],
  ["SR","Suriname"],
  ["SE","Sweden"],
  ["CH","Switzerland"],
  ["SY","Syria"],

  ["TJ","Tajikistan"],
  ["TZ","Tanzania"],
  ["TH","Thailand"],
  ["TL","Timor-Leste"],
  ["TG","Togo"],
  ["TO","Tonga"],
  ["TT","Trinidad and Tobago"],
  ["TN","Tunisia"],
  ["TR","Türkiye"],
  ["TM","Turkmenistan"],
  ["TV","Tuvalu"],

  ["UG","Uganda"],
  ["UA","Ukraine"],
  ["AE","United Arab Emirates"],
  ["GB","United Kingdom"],
  ["US","United States"],
  ["UY","Uruguay"],
  ["UZ","Uzbekistan"],

  ["VU","Vanuatu"],
  ["VA","Holy See"],
  ["VE","Venezuela"],
  ["VN","Vietnam"],

  ["YE","Yemen"],

  ["ZM","Zambia"],
  ["ZW","Zimbabwe"]

];


/* =====================================================
   FLAG
===================================================== */

function countryCodeToFlag(code) {
  return code
    .toUpperCase()
    .split("")
    .map(char =>
      String.fromCodePoint(
        127397 + char.charCodeAt(0)
      )
    )
    .join("");
}


/* =====================================================
   COUNTRY INFO
===================================================== */

const info = {};

for (const [code, name] of countryData) {

  const key = name.replace(
    /[^a-zA-Z0-9]+/g,
    ""
  );

  info[key] = {
    code,
    name,
    flag: countryCodeToFlag(code)
  };
}


/* =====================================================
   ALIASES
===================================================== */

const aliases = {

  Afghanistan: ["afghan"],

  Bangladesh: ["bangla"],

  Bhutan: ["bhutanese"],

  BosniaandHerzegovina: [
    "bosnia",
    "bosnia herzegovina"
  ],

  Brunei: [
    "brunei darussalam"
  ],

  CapeVerde: [
    "cabo verde"
  ],

  Congo: [
    "republic of congo",
    "republic of the congo"
  ],

  CoteDIvoire: [
    "ivory coast",
    "cote d ivoire"
  ],

  DemocraticRepublicoftheCongo: [
    "dr congo",
    "drc",
    "democratic republic of congo",
    "democratic republic of the congo"
  ],

  Czechia: [
    "czech republic"
  ],

  Eswatini: [
    "swaziland"
  ],

  Iran: [
    "persia"
  ],

  Laos: [
    "lao"
  ],

  Myanmar: [
    "burma"
  ],

  Palestine: [
    "palestinian"
  ],

  SouthKorea: [
    "korea",
    "south korea",
    "republic of korea"
  ],

  TimorLeste: [
    "east timor"
  ],

  Turkiye: [
    "turkey",
    "turkiye",
    "türkiye"
  ],

  UnitedArabEmirates: [
    "uae",
    "dubai"
  ],

  UnitedKingdom: [
    "uk",
    "britain",
    "great britain",
    "england"
  ],

  UnitedStates: [
    "usa",
    "united states of america",
    "america"
  ],

  HolySee: [
    "vatican",
    "vatican city"
  ]

};


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(text) {

  return String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* =====================================================
   COUNTRY SEARCH
===================================================== */

const countrySearchList = [];

for (const [code, name] of countryData) {

  const key = name.replace(
    /[^a-zA-Z0-9]+/g,
    ""
  );

  const terms = [name];

  if (aliases[key]) {
    terms.push(...aliases[key]);
  }

  for (const term of terms) {

    const normalized = normalize(term);

    if (!normalized) continue;

    countrySearchList.push({
      country: key,
      alias: normalized,
      length: normalized.length
    });
  }
}

countrySearchList.sort(
  (a, b) => b.length - a.length
);


/* =====================================================
   STATE
===================================================== */

const state = {};

for (const [code, name] of countryData) {

  const key = name.replace(
    /[^a-zA-Z0-9]+/g,
    ""
  );

  state[key] = {
    score: 0,
    commentCount: 0,
    superChats: 0,
    latestCommenter: ""
  };
}


/* =====================================================
   PLAYERS
===================================================== */

const players = {};


/* =====================================================
   EVENTS
===================================================== */

const eventQueue = [];

let eventCounter = 0;

let lastEvent = {
  id: "",
  country: "",
  countryName: "",
  flag: "",
  type: "",
  displayName: "",
  points: 0,
  message: "",
  amount: 0,
  amountMicros: 0,
  currency: "",
  hasCountry: false,
  time: 0
};


/* =====================================================
   FIND COUNTRY
===================================================== */

function findCountryInText(message) {

  const text = normalize(message);

  if (!text) return null;

  for (const item of countrySearchList) {

    const escaped = item.alias.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(
      "(^|\\s)" +
      escaped +
      "(?=\\s|$)",
      "i"
    );

    if (regex.test(text)) {
      return item.country;
    }
  }

  return null;
}


/* =====================================================
   PLAYER
===================================================== */

function getPlayer(displayName) {

  const name =
    String(displayName || "Anonymous").trim();

  const key = name.toLowerCase();

  if (!players[key]) {

    players[key] = {
      key,
      displayName: name,
      country: "",
      countryName: "",
      flag: "",
      score: 0,
      comments: 0,
      superChats: 0
    };
  }

  return players[key];
}


/* =====================================================
   EVENT
===================================================== */

function addEvent(data) {

  eventCounter++;

  const event = {
    id: `${Date.now()}-${eventCounter}`,
    ...data,
    time: Date.now()
  };

  eventQueue.push(event);

  while (eventQueue.length > MAX_EVENTS) {
    eventQueue.shift();
  }

  lastEvent = event;

  console.log(
    "EVENT:",
    JSON.stringify(event)
  );

  return event;
}


/* =====================================================
   YOUTUBE CHAT
===================================================== */

let liveChatId = null;

let nextPageToken = null;

let pollingTimer = null;

const seenMessageIds = new Set();


/* =====================================================
   GET LIVE CHAT
===================================================== */

async function getLiveChatId() {

  if (!API_KEY) {
    throw new Error(
      "YOUTUBE_API_KEY is missing."
    );
  }

  const response =
    await youtube.videos.list({
      part: ["liveStreamingDetails"],
      id: [VIDEO_ID]
    });

  const item =
    response.data.items &&
    response.data.items[0];

  if (!item) {
    throw new Error(
      `YouTube video not found: ${VIDEO_ID}`
    );
  }

  const details =
    item.liveStreamingDetails;

  if (!details) {
    throw new Error(
      "Selected video is not a live stream."
    );
  }

  liveChatId =
    details.activeLiveChatId || null;

  if (!liveChatId) {
    throw new Error(
      "YouTube Live Chat is not currently active."
    );
  }

  nextPageToken = null;

  console.log(
    "LIVE CHAT CONNECTED:",
    liveChatId
  );

  return liveChatId;
}


/* =====================================================
   PROCESS MESSAGE
===================================================== */

function processMessage(item) {

  try {

    if (!item || !item.id) return;

    if (seenMessageIds.has(item.id)) {
      return;
    }

    seenMessageIds.add(item.id);

    if (
      seenMessageIds.size >
      MAX_SEEN_MESSAGES
    ) {

      const first =
        seenMessageIds
          .values()
          .next()
          .value;

      seenMessageIds.delete(first);
    }

    const snippet =
      item.snippet || {};

    const author =
      item.authorDetails || {};

    const displayName =
      author.displayName ||
      "Anonymous";

    const type =
      snippet.type || "";

    let message = "";

    let amountMicros = 0;

    let currency = "";


    /* COMMENT */

    if (
      type === "textMessageEvent"
    ) {

      message =
        snippet.displayMessage ||
        snippet
          .textMessageDetails
          ?.messageText ||
        "";
    }


    /* SUPER CHAT */

    else if (
      type === "superChatEvent"
    ) {

      const details =
        snippet.superChatDetails ||
        {};

      message =
        details.userComment || "";

      amountMicros =
        Number(
          details.amountMicros || 0
        );

      currency =
        details.currency || "USD";
    }

    else {
      return;
    }


    const country =
      findCountryInText(message);


    /* NO COUNTRY */

    if (!country) {

      addEvent({

        country: "",
        countryName: "",
        flag: "",

        type:
          type === "superChatEvent"
            ? "superchat"
            : "comment",

        displayName,

        points: 0,

        message,

        amountMicros,

        amount:
          amountMicros / 1000000,

        currency,

        hasCountry: false
      });

      return;
    }


    const countryInfo =
      info[country];

    if (!countryInfo) return;


    /* =================================================
       COMMENT
    ================================================= */

    if (
      type === "textMessageEvent"
    ) {

      const points =
        COMMENT_POINTS;

      state[country].score += points;

      state[country].commentCount++;

      state[country].latestCommenter =
        displayName;


      const player =
        getPlayer(displayName);

      player.country = country;
      player.countryName =
        countryInfo.name;
      player.flag =
        countryInfo.flag;

      player.score += points;
      player.comments++;


      addEvent({

        country,

        countryName:
          countryInfo.name,

        flag:
          countryInfo.flag,

        type: "comment",

        displayName,

        points,

        message,

        amount: 0,

        amountMicros: 0,

        currency: "",

        hasCountry: true
      });

      return;
    }


    /* =================================================
       SUPER CHAT
    ================================================= */

    if (
      type === "superChatEvent"
    ) {

      const amount =
        amountMicros / 1000000;

      let points =
        Math.round(
          amount *
          SUPERCHAT_POINTS_PER_USD
        );

      points =
        Math.max(1, points);


      state[country].score += points;

      state[country].superChats++;

      state[country].latestCommenter =
        displayName;


      const player =
        getPlayer(displayName);

      player.country = country;

      player.countryName =
        countryInfo.name;

      player.flag =
        countryInfo.flag;

      player.score += points;

      player.superChats++;


      addEvent({

        country,

        countryName:
          countryInfo.name,

        flag:
          countryInfo.flag,

        type: "superchat",

        displayName,

        points,

        message,

        amount,

        amountMicros,

        currency,

        hasCountry: true
      });
    }

  } catch (error) {

    console.error(
      "PROCESS MESSAGE ERROR:",
      error
    );
  }
}


/* =====================================================
   POLL
===================================================== */

async function pollChat() {

  try {

    if (!liveChatId) {
      await getLiveChatId();
    }

    const params = {

      liveChatId,

      part: [
        "snippet",
        "authorDetails"
      ],

      maxResults: 200
    };

    if (nextPageToken) {
      params.pageToken =
        nextPageToken;
    }

    const response =
      await youtube
        .liveChatMessages
        .list(params);

    nextPageToken =
      response.data.nextPageToken ||
      null;

    const messages =
      response.data.items || [];

    console.log(
      `YouTube messages received: ${messages.length}`
    );

    for (const item of messages) {
      processMessage(item);
    }

    const wait =
      response.data.pollingIntervalMillis ||
      5000;

    schedulePoll(wait);

  } catch (error) {

    console.error(
      "YOUTUBE CHAT ERROR:",
      error.response?.data ||
      error.message
    );

    liveChatId = null;

    nextPageToken = null;

    schedulePoll(
      POLL_FALLBACK_MS
    );
  }
}


/* =====================================================
   SCHEDULE
===================================================== */

function schedulePoll(delay) {

  if (pollingTimer) {
    clearTimeout(pollingTimer);
  }

  pollingTimer =
    setTimeout(
      pollChat,
      Math.max(
        1000,
        Number(delay) || 5000
      )
    );
}


/* =====================================================
   COUNTRY LIST
===================================================== */

function buildCountryList() {

  return countryData
    .map(([code, name]) => {

      const key =
        name.replace(
          /[^a-zA-Z0-9]+/g,
          ""
        );

      return {

        country: key,

        countryName: name,

        code,

        flag:
          countryCodeToFlag(code),

        score:
          state[key]?.score || 0,

        commentCount:
          state[key]?.commentCount || 0,

        superChats:
          state[key]?.superChats || 0,

        latestCommenter:
          state[key]?.latestCommenter || ""

      };
    })
    .sort((a, b) => {

      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (
        b.commentCount !==
        a.commentCount
      ) {
        return (
          b.commentCount -
          a.commentCount
        );
      }

      return a.countryName.localeCompare(
        b.countryName
      );
    });
}


/* =====================================================
   TOP 3
===================================================== */

function buildTopThree() {

  return buildCountryList()
    .filter(country => country.score > 0)
    .slice(0, 3);
}


/* =====================================================
   API - STATE
===================================================== */

app.get(
  "/api/state",
  (req, res) => {

    res.json({

      success: true,

      videoId: VIDEO_ID,

      countries:
        buildCountryList(),

      top3:
        buildTopThree(),

      players:
        Object.values(players)
          .sort(
            (a, b) =>
              b.score - a.score
          )
          .slice(0, 100),

      lastEvent,

      events:
        eventQueue.slice(-100)

    });
  }
);


/* =====================================================
   API - EVENTS
===================================================== */

app.get(
  "/api/events",
  (req, res) => {

    res.json({
      success: true,
      events: eventQueue
    });
  }
);


/* =====================================================
   API - TOP 3
===================================================== */

app.get(
  "/api/top3",
  (req, res) => {

    res.json({
      success: true,
      top3: buildTopThree()
    });
  }
);


/* =====================================================
   AP
