const express = require("express");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY;
const VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || "4-hwNZmdgzo";

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
    "turkey"
  ],

  UAE: [
    "uae"
  ],

  UK: [
    "uk"
  ],

  USA: [
    "usa",
    "united states of america"
  ],

  Vatican: [
    "vatican",
    "vatican city",
    "holy see"
  ]

};


// =====================================================
// TEXT NORMALIZER
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
// BUILD COUNTRY LIST
// =====================================================

const countries = {};

for (const country of Object.keys(info)) {

  countries[country] = [
    normalize(info[country][1])
  ];

}


// Add aliases

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
// FIND EXACT COUNTRY FROM NORMAL COMMENT
// =====================================================

function findExactCountry(message) {

  const text = normalize(message);

  if (!text) {
    return null;
  }

  for (const country of Object.keys(countries)) {

    for (const alias of countries[country]) {

      if (text === alias) {

        return country;

      }

    }

  }

  return null;

}


// =====================================================
// FIND COUNTRY INSIDE SUPER CHAT MESSAGE
// =====================================================

function findCountryInText(message) {

  const text = normalize(message);

  if (!text) {
    return null;
  }

  const list = [];

  for (const country of Object.keys(countries)) {

    for (const alias of countries[country]) {

      list.push({
        country,
        alias
      });

    }

  }

  // Longer country names first
  list.sort(
    (a, b) =>
      b.alias.length - a.alias.length
  );

  for (const item of list) {

    const escaped =
      item.alias.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const regex =
      new RegExp(
        "(^|\\s)" +
        escaped +
        "(?=\\s|$)"
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
      "Live chat is not active yet."
    );

  }

  nextPageToken = null;

  console.log(
    "Live Chat ID found:",
    liveChatId
  );

}


// =====================================================
// PROCESS MESSAGE
// =====================================================

function processMessage(item) {

  if (!item || !item.id) {
    return;
  }

  // Prevent duplicate messages
  if (seenMessageIds.has(item.id)) {
    return;
  }

  seenMessageIds.add(item.id);

  // Keep memory small
  if (seenMessageIds.size > 5000) {

    const first =
      seenMessageIds.values().next().value;

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


  // Normal text comment

  if (
    type === "textMessageEvent"
  ) {

    message =
      snippet.displayMessage ||
      (
        snippet.textMessageDetails &&
        snippet.textMessageDetails.messageText
      ) ||
      "";

  }


  // Super Chat

  if (
    type === "superChatEvent"
  ) {

    message =
      (
        snippet.superChatDetails &&
        snippet.superChatDetails.userComment
      ) ||
      "";

  }


  if (!message) {
    return;
  }


  // ===================================================
  // NORMAL COMMENT
  // ===================================================

  if (
    type === "textMessageEvent"
  ) {

    const country =
      findExactCountry(message);

    if (!country) {
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

      time: Date.now()

    };


    console.log(
      `COMMENT +1 | ${country} | ${displayName}`
    );

    return;

  }


  // ===================================================
  // SUPER CHAT
  // ===================================================

  if (
    type === "superChatEvent"
  ) {

    const country =
      findCountryInText(message);

    if (!country) {
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

      time: Date.now()

    };


    console.log(
      `SUPER CHAT +10 | ${country} | ${displayName}`
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
      await youtube.liveChatMessages.list(
        params
      );


    nextPageToken =
      response.data.nextPageToken ||
      nextPageToken;


    const messages =
      response.data.items || [];


    for (const item of messages) {

      processMessage(item);

    }


    const wait =
      response.data.pollingIntervalMillis ||
      5000;


    schedulePoll(wait);


  } catch (error) {

    console.error(
      "YouTube Chat Error:",
      error.message
    );


    // Reset chat when the current
    // live chat is no longer available

    if (
      error.code === 403 ||
      error.code === 404
    ) {

      liveChatId = null;

      nextPageToken = null;

    }


    schedulePoll(10000);

  }

}


// =====================================================
// SCHEDULE NEXT POLL
// =====================================================

function schedulePoll(milliseconds) {

  if (pollingTimer) {

    clearTimeout(pollingTimer);

  }

  pollingTimer =
    setTimeout(
      pollChat,
      Math.max(milliseconds, 1000)
    );

}


// =====================================================
// API STATE
// =====================================================

app.get(
  "/api/state",
  (req, res) => {

    const result = {};


    for (
      const country of Object.keys(countries)
    ) {

      const item =
        state[country] || {

          score: 0,

          commentCount: 0,

          superChats: 0,

          latestCommenter: ""

        };


      const meta =
        info[country] ||
        ["🌍", country];


      result[country] = {

        key: country,

        name: meta[1],

        flag: meta[0],

        score: item.score || 0,

        latestCommenter:
          item.latestCommenter || ""

      };

    }


    const activeCountries =
      Object.values(result)
        .filter(
          x => x.score > 0
        )
        .length;


    const totalComments =
      Object.values(state)
        .reduce(
          (sum, x) =>
            sum +
            (x.commentCount || 0),
          0
        );


    const totalSuperChats =
      Object.values(state)
        .reduce(
          (sum, x) =>
            sum +
            (x.superChats || 0),
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

        lastEvent

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
// FRONTEND
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
// START SERVER
// =====================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "Country Battle server running on port",
      PORT
    );

    console.log(
      "Video ID:",
      VIDEO_ID
    );

    console.log(
      "Countries loaded:",
      Object.keys(info).length
    );


    if (!API_KEY) {

      console.error(
        "WARNING: YOUTUBE_API_KEY is missing!"
      );

    }


    // Start YouTube chat polling

    pollChat();

  }
);
