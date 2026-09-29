const express = require("express");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY;

// =====================================================
// YOUTUBE LIVE VIDEO ID
// =====================================================

const VIDEO_ID =
  process.env.YOUTUBE_VIDEO_ID || "5cf-uUwfw1s";

// =====================================================
// YOUTUBE API
// =====================================================

const youtube = google.youtube({
  version: "v3",
  auth: API_KEY
});

// =====================================================
// 195 COUNTRIES
// =====================================================

const info = {

  Afghanistan: ["🇦🇫", "Afghanistan"],
  Albania: ["🇦🇱", "Albania"],
  Algeria: ["🇩🇿", "Algeria"],
  Andorra: ["🇦🇩", "Andorra"],
  Angola: ["🇦🇴", "Angola"],
  AntiguaBarbuda: ["🇦🇬", "Antigua and Barbuda"],
  Argentina: ["🇦🇷", "Argentina"],
  Armenia: ["🇦🇲", "Armenia"],
  Australia: ["🇦🇺", "Australia"],
  Austria: ["🇦🇹", "Austria"],
  Azerbaijan: ["🇦🇿", "Azerbaijan"],

  Bahamas: ["🇧🇸", "Bahamas"],
  Bahrain: ["🇧🇭", "Bahrain"],
  Bangladesh: ["🇧🇩", "Bangladesh"],
  Barbados: ["🇧🇧", "Barbados"],
  Belarus: ["🇧🇾", "Belarus"],
  Belgium: ["🇧🇪", "Belgium"],
  Belize: ["🇧🇿", "Belize"],
  Benin: ["🇧🇯", "Benin"],
  Bhutan: ["🇧🇹", "Bhutan"],
  Bolivia: ["🇧🇴", "Bolivia"],
  BosniaHerzegovina: ["🇧🇦", "Bosnia and Herzegovina"],
  Botswana: ["🇧🇼", "Botswana"],
  Brazil: ["🇧🇷", "Brazil"],
  Brunei: ["🇧🇳", "Brunei"],
  Bulgaria: ["🇧🇬", "Bulgaria"],
  BurkinaFaso: ["🇧🇫", "Burkina Faso"],
  Burundi: ["🇧🇮", "Burundi"],

  Cambodia: ["🇰🇭", "Cambodia"],
  Cameroon: ["🇨🇲", "Cameroon"],
  Canada: ["🇨🇦", "Canada"],
  CapeVerde: ["🇨🇻", "Cape Verde"],
  CentralAfricanRepublic: ["🇨🇫", "Central African Republic"],
  Chad: ["🇹🇩", "Chad"],
  Chile: ["🇨🇱", "Chile"],
  China: ["🇨🇳", "China"],
  Colombia: ["🇨🇴", "Colombia"],
  Comoros: ["🇰🇲", "Comoros"],
  Congo: ["🇨🇬", "Congo"],
  CoteDIvoire: ["🇨🇮", "Côte d'Ivoire"],
  CostaRica: ["🇨🇷", "Costa Rica"],
  Croatia: ["🇭🇷", "Croatia"],
  Cuba: ["🇨🇺", "Cuba"],
  Cyprus: ["🇨🇾", "Cyprus"],
  Czechia: ["🇨🇿", "Czechia"],

  DemocraticRepublicCongo: [
    "🇨🇩",
    "Democratic Republic of the Congo"
  ],

  Denmark: ["🇩🇰", "Denmark"],
  Djibouti: ["🇩🇯", "Djibouti"],
  Dominica: ["🇩🇲", "Dominica"],
  DominicanRepublic: ["🇩🇴", "Dominican Republic"],

  Ecuador: ["🇪🇨", "Ecuador"],
  Egypt: ["🇪🇬", "Egypt"],
  ElSalvador: ["🇸🇻", "El Salvador"],
  EquatorialGuinea: ["🇬🇶", "Equatorial Guinea"],
  Eritrea: ["🇪🇷", "Eritrea"],
  Estonia: ["🇪🇪", "Estonia"],
  Eswatini: ["🇸🇿", "Eswatini"],
  Ethiopia: ["🇪🇹", "Ethiopia"],

  Fiji: ["🇫🇯", "Fiji"],
  Finland: ["🇫🇮", "Finland"],
  France: ["🇫🇷", "France"],

  Gabon: ["🇬🇦", "Gabon"],
  Gambia: ["🇬🇲", "Gambia"],
  Georgia: ["🇬🇪", "Georgia"],
  Germany: ["🇩🇪", "Germany"],
  Ghana: ["🇬🇭", "Ghana"],
  Greece: ["🇬🇷", "Greece"],
  Grenada: ["🇬🇩", "Grenada"],
  Guatemala: ["🇬🇹", "Guatemala"],
  Guinea: ["🇬🇳", "Guinea"],
  GuineaBissau: ["🇬🇼", "Guinea-Bissau"],
  Guyana: ["🇬🇾", "Guyana"],

  Haiti: ["🇭🇹", "Haiti"],
  Honduras: ["🇭🇳", "Honduras"],
  Hungary: ["🇭🇺", "Hungary"],

  Iceland: ["🇮🇸", "Iceland"],
  India: ["🇮🇳", "India"],
  Indonesia: ["🇮🇩", "Indonesia"],
  Iran: ["🇮🇷", "Iran"],
  Iraq: ["🇮🇶", "Iraq"],
  Ireland: ["🇮🇪", "Ireland"],
  Israel: ["🇮🇱", "Israel"],
  Italy: ["🇮🇹", "Italy"],

  Jamaica: ["🇯🇲", "Jamaica"],
  Japan: ["🇯🇵", "Japan"],
  Jordan: ["🇯🇴", "Jordan"],

  Kazakhstan: ["🇰🇿", "Kazakhstan"],
  Kenya: ["🇰🇪", "Kenya"],
  Kiribati: ["🇰🇮", "Kiribati"],
  Kuwait: ["🇰🇼", "Kuwait"],
  Kyrgyzstan: ["🇰🇬", "Kyrgyzstan"],

  Laos: ["🇱🇦", "Laos"],
  Latvia: ["🇱🇻", "Latvia"],
  Lebanon: ["🇱🇧", "Lebanon"],
  Lesotho: ["🇱🇸", "Lesotho"],
  Liberia: ["🇱🇷", "Liberia"],
  Libya: ["🇱🇾", "Libya"],
  Liechtenstein: ["🇱🇮", "Liechtenstein"],
  Lithuania: ["🇱🇹", "Lithuania"],
  Luxembourg: ["🇱🇺", "Luxembourg"],

  Madagascar: ["🇲🇬", "Madagascar"],
  Malawi: ["🇲🇼", "Malawi"],
  Malaysia: ["🇲🇾", "Malaysia"],
  Maldives: ["🇲🇻", "Maldives"],
  Mali: ["🇲🇱", "Mali"],
  Malta: ["🇲🇹", "Malta"],
  MarshallIslands: ["🇲🇭", "Marshall Islands"],
  Mauritania: ["🇲🇷", "Mauritania"],
  Mauritius: ["🇲🇺", "Mauritius"],
  Mexico: ["🇲🇽", "Mexico"],
  Micronesia: ["🇫🇲", "Micronesia"],
  Moldova: ["🇲🇩", "Moldova"],
  Monaco: ["🇲🇨", "Monaco"],
  Mongolia: ["🇲🇳", "Mongolia"],
  Montenegro: ["🇲🇪", "Montenegro"],
  Morocco: ["🇲🇦", "Morocco"],
  Mozambique: ["🇲🇿", "Mozambique"],
  Myanmar: ["🇲🇲", "Myanmar"],

  Namibia: ["🇳🇦", "Namibia"],
  Nauru: ["🇳🇷", "Nauru"],
  Nepal: ["🇳🇵", "Nepal"],
  Netherlands: ["🇳🇱", "Netherlands"],
  NewZealand: ["🇳🇿", "New Zealand"],
  Nicaragua: ["🇳🇮", "Nicaragua"],
  Niger: ["🇳🇪", "Niger"],
  Nigeria: ["🇳🇬", "Nigeria"],
  NorthKorea: ["🇰🇵", "North Korea"],
  NorthMacedonia: ["🇲🇰", "North Macedonia"],
  Norway: ["🇳🇴", "Norway"],

  Oman: ["🇴🇲", "Oman"],

  Pakistan: ["🇵🇰", "Pakistan"],
  Palau: ["🇵🇼", "Palau"],
  Palestine: ["🇵🇸", "Palestine"],
  Panama: ["🇵🇦", "Panama"],
  PapuaNewGuinea: ["🇵🇬", "Papua New Guinea"],
  Paraguay: ["🇵🇾", "Paraguay"],
  Peru: ["🇵🇪", "Peru"],
  Philippines: ["🇵🇭", "Philippines"],
  Poland: ["🇵🇱", "Poland"],
  Portugal: ["🇵🇹", "Portugal"],

  Qatar: ["🇶🇦", "Qatar"],

  Romania: ["🇷🇴", "Romania"],
  Russia: ["🇷🇺", "Russia"],
  Rwanda: ["🇷🇼", "Rwanda"],

  SaintKittsNevis: ["🇰🇳", "Saint Kitts and Nevis"],
  SaintLucia: ["🇱🇨", "Saint Lucia"],
  SaintVincentGrenadines: [
    "🇻🇨",
    "Saint Vincent and the Grenadines"
  ],
  Samoa: ["🇼🇸", "Samoa"],
  SanMarino: ["🇸🇲", "San Marino"],
  SaoTomePrincipe: ["🇸🇹", "Sao Tome and Principe"],
  SaudiArabia: ["🇸🇦", "Saudi Arabia"],
  Senegal: ["🇸🇳", "Senegal"],
  Serbia: ["🇷🇸", "Serbia"],
  Seychelles: ["🇸🇨", "Seychelles"],
  SierraLeone: ["🇸🇱", "Sierra Leone"],
  Singapore: ["🇸🇬", "Singapore"],
  Slovakia: ["🇸🇰", "Slovakia"],
  Slovenia: ["🇸🇮", "Slovenia"],
  SolomonIslands: ["🇸🇧", "Solomon Islands"],
  Somalia: ["🇸🇴", "Somalia"],
  SouthAfrica: ["🇿🇦", "South Africa"],
  SouthKorea: ["🇰🇷", "South Korea"],
  SouthSudan: ["🇸🇸", "South Sudan"],
  Spain: ["🇪🇸", "Spain"],
  SriLanka: ["🇱🇰", "Sri Lanka"],
  Sudan: ["🇸🇩", "Sudan"],
  Suriname: ["🇸🇷", "Suriname"],
  Sweden: ["🇸🇪", "Sweden"],
  Switzerland: ["🇨🇭", "Switzerland"],
  Syria: ["🇸🇾", "Syria"],

  Tajikistan: ["🇹🇯", "Tajikistan"],
  Tanzania: ["🇹🇿", "Tanzania"],
  Thailand: ["🇹🇭", "Thailand"],
  TimorLeste: ["🇹🇱", "Timor-Leste"],
  Togo: ["🇹🇬", "Togo"],
  Tonga: ["🇹🇴", "Tonga"],
  TrinidadTobago: ["🇹🇹", "Trinidad and Tobago"],
  Tunisia: ["🇹🇳", "Tunisia"],
  Turkey: ["🇹🇷", "Türkiye"],
  Turkmenistan: ["🇹🇲", "Turkmenistan"],
  Tuvalu: ["🇹🇻", "Tuvalu"],

  Uganda: ["🇺🇬", "Uganda"],
  Ukraine: ["🇺🇦", "Ukraine"],
  UAE: ["🇦🇪", "United Arab Emirates"],
  UK: ["🇬🇧", "United Kingdom"],
  USA: ["🇺🇸", "United States"],
  Uruguay: ["🇺🇾", "Uruguay"],
  Uzbekistan: ["🇺🇿", "Uzbekistan"],

  Vanuatu: ["🇻🇺", "Vanuatu"],
  Vatican: ["🇻🇦", "Holy See"],
  Venezuela: ["🇻🇪", "Venezuela"],
  Vietnam: ["🇻🇳", "Vietnam"],

  Yemen: ["🇾🇪", "Yemen"],

  Zambia: ["🇿🇲", "Zambia"],
  Zimbabwe: ["🇿🇼", "Zimbabwe"]
};

// =====================================================
// COUNTRY ALIASES
// =====================================================

const aliases = {

  CoteDIvoire: [
    "cote d ivoire",
    "ivory coast"
  ],

  DemocraticRepublicCongo: [
    "democratic republic of the congo",
    "dr congo",
    "drc"
  ],

  Congo: [
    "republic of the congo"
  ],

  CapeVerde: [
    "cabo verde"
  ],

  Czechia: [
    "czech republic"
  ],

  Eswatini: [
    "swaziland"
  ],

  Myanmar: [
    "burma"
  ],

  TimorLeste: [
    "east timor"
  ],

  Turkey: [
    "turkey",
    "türkiye"
  ],

  UAE: [
    "uae"
  ],

  UK: [
    "uk",
    "great britain",
    "britain"
  ],

  USA: [
    "usa",
    "us",
    "united states of america"
  ],

  Vatican: [
    "vatican",
    "vatican city",
    "holy see"
  ]
};

// =====================================================
// NORMALIZE TEXT
// =====================================================

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

// =====================================================
// BUILD COUNTRY SEARCH LIST
// =====================================================

const countries = {};

for (const country of Object.keys(info)) {

  countries[country] = [
    normalize(info[country][1])
  ];

}

for (const country of Object.keys(aliases)) {

  if (!countries[country]) {
    countries[country] = [];
  }

  for (const alias of aliases[country]) {

    countries[country].push(
      normalize(alias)
    );

  }

}

const countrySearchList = [];

for (const country of Object.keys(countries)) {

  for (const alias of countries[country]) {

    if (!alias) continue;

    countrySearchList.push({
      country,
      alias
    });

  }

}

countrySearchList.sort(
  (a, b) =>
    b.alias.length - a.alias.length
);

// =====================================================
// GAME STATE
// =====================================================

const state = {};

for (const country of Object.keys(info)) {

  state[country] = {

    score: 0,

    commentCount: 0,

    superChats: 0,

    latestCommenter: ""

  };

}

// =====================================================
// FIND COUNTRY IN COMMENT
// =====================================================

function findCountryInText(message) {

  const text = normalize(message);

  if (!text) {
    return null;
  }

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

// =====================================================
// LAST EVENT
// =====================================================

let lastEvent = {

  id: "",

  country: "",

  type: "",

  displayName: "",

  points: 0,

  message: "",

  time: 0

};

// =====================================================
// YOUTUBE LIVE CHAT
// =====================================================

let liveChatId = null;

let nextPageToken = null;

let pollingTimer = null;

const seenMessageIds = new Set();

// =====================================================
// GET LIVE CHAT ID
// =====================================================

async function getLiveChatId() {

  try {

    const response =
      await youtube.videos.list({

        part: [
          "liveStreamingDetails"
        ],

        id: [
          VIDEO_ID
        ]

      });

    const item =
      response.data.items &&
      response.data.items[0];

    if (!item) {

      throw new Error(
        "YouTube video not found."
      );

    }

    const details =
      item.liveStreamingDetails;

    if (!details) {

      throw new Error(
        "This video is not a live stream."
      );

    }

    liveChatId =
      details.activeLiveChatId || null;

    if (!liveChatId) {

      throw new Error(
        "Live chat is not active."
      );

    }

    nextPageToken = null;

    console.log(
      "LIVE CHAT CONNECTED:",
      liveChatId
    );

  } catch (error) {

    liveChatId = null;

    console.error(
      "GET LIVE CHAT ERROR:",
      error.response?.data || error.message
    );

    throw error;

  }

}

// =====================================================
// PROCESS YOUTUBE MESSAGE
// =====================================================

function processMessage(item) {

  try {

    if (!item || !item.id) {
      return;
    }

    if (seenMessageIds.has(item.id)) {
      return;
    }

    seenMessageIds.add(item.id);

    if (seenMessageIds.size > 5000) {

      const firstId =
        seenMessageIds
          .values()
          .next()
          .value;

      seenMessageIds.delete(firstId);

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

    if (type === "textMessageEvent") {

      message =
        snippet.displayMessage ||
        (
          snippet.textMessageDetails &&
          snippet.textMessageDetails.messageText
        ) ||
        "";

    }

    if (type === "superChatEvent") {

      message =
        (
          snippet.superChatDetails &&
          snippet.superChatDetails.userComment
        ) ||
        "";

    }

    if (!message) {

      console.log(
        "MESSAGE WITHOUT TEXT:",
        displayName
      );

      return;

    }

    console.log(
      "YOUTUBE:",
      displayName,
      "=>",
      message
    );

    // =================================================
    // NORMAL COMMENT = +1
    // =================================================

    if (type === "textMessageEvent") {

      const country =
        findCountryInText(message);

      if (!country) {

        console.log(
          "NO COUNTRY FOUND:",
          message
        );

        return;

      }

      state[country].score += 1;

      state[country].commentCount += 1;

      state[country].latestCommenter =
        displayName;

      lastEvent = {

        id: item.id,

        country: country,

        type: "comment",

        displayName: displayName,

        points: 1,

        message: message,

        time: Date.now()

      };

      console.log(
        `COMMENT +1 | ${displayName} | ${country}`
      );

      return;

    }

    // =================================================
    // SUPER CHAT = +10
    // =================================================

    if (type === "superChatEvent") {

      const country =
        findCountryInText(message);

      if (!country) {

        console.log(
          "NO COUNTRY FOUND IN SUPER CHAT:",
          message
        );

        return;

      }

      state[country].score += 10;

      state[country].superChats += 1;

      state[country].latestCommenter =
        displayName;

      lastEvent = {

        id: item.id,

        country: country,

        type: "superchat",

        displayName: displayName,

        points: 10,

        message: message,

        time: Date.now()

      };

      console.log(
        `SUPER CHAT +10 | ${displayName} | ${country}`
      );

    }

  } catch (error) {

    console.error(
      "PROCESS MESSAGE ERROR:",
      error.message
    );

  }

}

// =====================================================
// POLL YOUTUBE CHAT
// =====================================================

async function pollChat() {

  try {

    if (!liveChatId) {

      await getLiveChatId();

    }

    const params = {

      liveChatId: liveChatId,

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
      "YouTube messages:",
      messages.length
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

    schedulePoll(10000);

  }

}

// =====================================================
// SCHEDULE POLL
// =====================================================

function schedulePoll(milliseconds) {

  if (pollingTimer) {

    clearTimeout(
      pollingTimer
    );

  }

  pollingTimer =
    setTimeout(
      pollChat,
      Math.max(
        milliseconds || 5000,
        1000
      )
    );

}

// =====================================================
// API STATE
// =====================================================

app.get(
  "/api/state",
  (req, res) => {

    const result = {};

    for (const country of Object.keys(info)) {

      const item =
        state[country] || {

          score: 0,

          commentCount: 0,

          superChats: 0,

          latestCommenter: ""

        };

      result[country] = {

        key: country,

        name: info[country][1],

        flag: info[country][0],

        score: item.score || 0,

        commentCount:
          item.commentCount || 0,

        superChats:
          item.superChats || 0,

        latestCommenter:
          item.latestCommenter || ""

      };

    }

    const activeCountries =
      Object.entries(result)
        .filter(
          ([country, item]) =>
            item.score > 0
        )
        .sort(
          (a, b) =>
            b[1].score - a[1].score
        )
        .map(
          ([country, item]) => ({

            country: country,

            name: item.name,

            flag: item.flag,

            score: item.score,

            commentCount:
              item.commentCount,

            superChats:
              item.superChats,

            latestCommenter:
              item.latestCommenter

          })
        );

    const totalComments =
      Object.values(state)
        .reduce(
          (sum, item) =>
            sum +
            (item.commentCount || 0),
          0
        );

    const totalSuperChats =
      Object.values(state)
        .reduce(
          (sum, item) =>
            sum +
            (item.superChats || 0),
          0
        );

    res.json({

      countries: result,

      activeCountries:
        activeCountries,

      totalComments:
        totalComments,

      totalSuperChats:
        totalSuperChats,

      lastEvent:
        lastEvent,

      liveChatConnected:
        !!liveChatId

    });

  }
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/health",
  (req, res) => {

    res.json({

      ok: true,

      videoId: VIDEO_ID,

      liveChatConnected:
        !!liveChatId,

      countries:
        Object.keys(info).length

    });

  }
);

// =====================================================
// STATIC FRONTEND
// =====================================================

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);

// =====================================================
// FRONTEND FALLBACK
// =====================================================

app.use(
  (req, res, next) => {

    if (req.method !== "GET") {
      return next();
    }

    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );

  }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "================================="
    );

    console.log(
      "COUNTRY BATTLE SERVER STARTED"
    );

    console.log(
      "PORT:",
      PORT
    );

    console.log(
      "VIDEO ID:",
      VIDEO_ID
    );

    console.log(
   
