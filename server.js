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
  process.env.YOUTUBE_VIDEO_ID || "iGU1VUXCWvs";

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
  Uruguay: ["🇺🇾
