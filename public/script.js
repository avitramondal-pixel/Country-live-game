/* ============================================================
   COUNTRY BATTLE LIVE — FRONTEND
============================================================ */

window.onerror = function(msg, url, line){
  var eb = document.getElementById("errorBanner");
  if(eb){
    eb.style.display = "block";
    eb.textContent = "JS ERROR: " + msg + " @ line " + line;
  }
  return false;
};

(function () {
  "use strict";

  var bgMusic      = document.getElementById("bgMusic");
  var musicButton  = document.getElementById("musicButton");
  var voiceButton  = document.getElementById("voiceButton");
  var eventBanner  = document.getElementById("eventBanner");
  var topPlayersEl = document.getElementById("topPlayers");
  var topCountriesEl = document.getElementById("topCountries");
  var countryGridEl = document.getElementById("countryGrid");
  var connectionEl = document.getElementById("connectionBadge");

  var musicEnabled = false;
  var voiceEnabled = true;
  var voiceQueue = [];
  var speaking = false;
  var lastEventId = "";
  var firstLoadDone = false;
  var fetching = false;
  var voiceLang = "en-US";
  var masterCountries = [];

  /* ---------- Helpers ---------- */

  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fmtNumber(n){
    return Number(n || 0).toLocaleString("en-US");
  }

  function fmtUSD(n){
    return "$" + Number(n || 0).toFixed(2);
  }

  function safeAvatar(url){
    if(!url) return "";
    if(/^https:\/\//i.test(url)) return url;
    return "";
  }

  /* ---------- Music ---------- */

  function startMusic(){
    try{
      bgMusic.volume = 0.15;
      var p = bgMusic.play();
      if(p && p.then){
        p.then(function(){
          musicEnabled = true;
          musicButton.textContent = "🎵 MUSIC ON";
          musicButton.classList.add("on");
        }).catch(function(){
          musicEnabled = false;
          musicButton.textContent = "🎵 MUSIC OFF";
          musicButton.classList.remove("on");
        });
      }
    }catch(e){
      musicEnabled = false;
    }
  }

  musicButton.addEventListener("click", function(){
    if(bgMusic.paused || !musicEnabled){
      startMusic();
    } else {
      bgMusic.pause();
      musicEnabled = false;
      musicButton.textContent = "🎵 MUSIC OFF";
      musicButton.classList.remove("on");
    }
  });

  /* ---------- Voice ---------- */

  voiceButton.addEventListener("click", function(){
    voiceEnabled = !voiceEnabled;
    if(!voiceEnabled){
      if("speechSynthesis" in window) speechSynthesis.cancel();
      voiceQueue = [];
      speaking = false;
      voiceButton.textContent = "🔇 VOICE OFF";
      voiceButton.classList.remove("on");
    } else {
      voiceButton.textContent = "🔊 VOICE ON";
      voiceButton.classList.add("on");
    }
  });

  function enqueueVoice(text){
    if(!voiceEnabled) return;
    if(!("speechSynthesis" in window)) return;
    if(!text) return;
    voiceQueue.push(String(text).slice(0, 250));
    pumpVoice();
  }

  function pumpVoice(){
    if(speaking) return;
    if(voiceQueue.length === 0) return;
    if(!voiceEnabled){ voiceQueue = []; return; }

    var text = voiceQueue.shift();
    speaking = true;

    if(musicEnabled && !bgMusic.paused){
      bgMusic.volume = 0.04;
    }

    var u = new SpeechSynthesisUtterance(text);
    u.lang = voiceLang;
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = 1;

    u.onend = function(){
      speaking = false;
      if(musicEnabled && !bgMusic.paused) bgMusic.volume = 0.15;
      setTimeout(pumpVoice, 250);
    };
    u.onerror = function(){
      speaking = false;
      if(musicEnabled && !bgMusic.paused) bgMusic.volume = 0.15;
      setTimeout(pumpVoice, 250);
    };

    try { speechSynthesis.speak(u); }
    catch(e){ speaking = false; }
  }

  /* ---------- Announce (English) ---------- */

  function announceEvent(ev){
    if(!ev || !ev.id) return;
    if(!firstLoadDone){ lastEventId = ev.id; return; }
    if(ev.id === lastEventId) return;
    lastEventId = ev.id;

    var name = ev.displayName || "Someone";
    var country = ev.countryName || "";
    var points = Number(ev.points || 0);

    if(ev.type === "superchat"){
      var usd = Number(ev.amount || 0);
      var cur = ev.currency || "USD";
      enqueueVoice(
        "Super Chat! " + name + " from " + country +
        " sent " + usd.toFixed(2) + " " + cur +
        " and scored " + fmtNumber(points) + " points!"
      );
      return;
    }

    if(ev.type === "comment" && points > 0){
      enqueueVoice(
        name + " from " + country +
        " just scored " + fmtNumber(points) + " " +
        (points === 1 ? "point" : "points") + "!"
      );
      return;
    }

    if(ev.type === "comment" && points === 0){
      enqueueVoice(name + " commented.");
    }
  }

  /* ---------- Render: Top 3 Players ---------- */

  function renderTopPlayers(players){
    if(!topPlayersEl) return;
    players = players || [];

    var sorted = players
      .filter(function(p){ return p && (Number(p.amount) > 0 || Number(p.score) > 0); })
      .sort(function(a, b){
        var da = Number(a.amount || 0), db = Number(b.amount || 0);
        if(db !== da) return db - da;
        return Number(b.score || 0) - Number(a.score || 0);
      })
      .slice(0, 3);

    var order = [1, 0, 2];
    var classes = ["rank-2", "rank-1", "rank-3"];
    var badgeNums = [2, 1, 3];
    var html = "";

    for(var s = 0; s < 3; s++){
      var p = sorted[order[s]];
      var cls = classes[s];
      var badge = badgeNums[s];

      if(!p){
        html +=
          '<div class="player-card ' + cls + '">' +
            '<div class="p-crown">👑</div>' +
            '<div class="p-rank-badge">' + badge + '</div>' +
            '<div class="p-avatar-wrap"><div class="p-avatar-fallback">👤</div></div>' +
            '<div class="p-name">Waiting...</div>' +
            '<div class="p-amount">$0.00</div>' +
            '<div class="p-country">— — —</div>' +
          '</div>';
        continue;
      }

      var av = safeAvatar(p.profileImageUrl);
      var avatarHTML = av
        ? '<img class="p-avatar" src="' + esc(av) + '" alt="">'
        : '<div class="p-avatar-fallback">👤</div>';

      html +=
        '<div class="player-card ' + cls + '">' +
          '<div class="p-crown">👑</div>' +
          '<div class="p-rank-badge">' + badge + '</div>' +
          '<div class="p-avatar-wrap">' + avatarHTML + '</div>' +
          '<div class="p-name">' + esc(p.displayName || "Player") + '</div>' +
          '<div class="p-amount">' + fmtUSD(p.amount || 0) + '</div>' +
          '<div class="p-country">' +
            '<span class="flag-mini">' + esc(p.flag || "🌍") + '</span>' +
            '<span>' + esc(p.countryName || "Unknown") + '</span>' +
          '</div>' +
        '</div>';
    }

    topPlayersEl.innerHTML = html;
  }

  /* ---------- Render: Top 3 Countries ---------- */

  function renderTopCountries(countries){
    if(!topCountriesEl) return;
    countries = countries || [];

    var sorted = countries
      .map(function(c){
        return { name: c.countryName, flag: c.flag, score: Number(c.score || 0) };
      })
      .filter(function(c){ return c.score > 0; })
      .sort(function(a, b){ return b.score - a.score; })
      .slice(0, 3);

    var order = [1, 0, 2];
    var classes = ["rank-2", "rank-1", "rank-3"];
    var badgeNums = [2, 1, 3];
    var html = "";

    for(var s = 0; s < 3; s++){
      var c = sorted[order[s]];
      var cls = classes[s];
      var badge = badgeNums[s];

      if(!c){
        html +=
          '<div class="tc-card ' + cls + '">' +
            '<div class="tc-crown">👑</div>' +
            '<div class="tc-rank-badge">#' + badge + '</div>' +
            '<div class="tc-flag-box">🏳️</div>' +
            '<div class="tc-points">0</div>' +
          '</div>';
        continue;
      }

      html +=
        '<div class="tc-card ' + cls + '">' +
          '<div class="tc-crown">👑</div>' +
          '<div class="tc-rank-badge">#' + badge + '</div>' +
          '<div class="tc-flag-box">' + esc(c.flag) + '</div>' +
          '<div class="tc-points">' + fmtNumber(c.score) + '</div>' +
        '</div>';
    }

    topCountriesEl.innerHTML = html;
  }

  /* ---------- Render: Country Grid ---------- */

  function renderCountryGrid(countries){
    if(!countryGridEl) return;
    var list = countries && countries.length ? countries.slice() : masterCountries.slice();

    var sorted = list.map(function(c){
      return { name: c.countryName, flag: c.flag, score: Number(c.score || 0) };
    }).sort(function(a, b){
      if(b.score !== a.score) return b.score - a.score;
      return String(a.name).localeCompare(String(b.name));
    });

    var html = "";
    for(var i = 0; i < sorted.length; i++){
      var rank = i + 1;
      var rankCls = "";
      if(rank === 1) rankCls = "rank-1";
      else if(rank === 2) rankCls = "rank-2";
      else if(rank === 3) rankCls = "rank-3";

      html +=
        '<div class="cell ' + rankCls + '">' +
          '<div class="cell-rank">#' + rank + '</div>' +
          '<div class="cell-flag">' + esc(sorted[i].flag) + '</div>' +
          '<div class="cell-points">' + fmtNumber(sorted[i].score) + '</div>' +
        '</div>';
    }
    countryGridEl.innerHTML = html;
  }

  /* ---------- Render: Event Banner ---------- */

  function renderEventBanner(ev){
    if(!eventBanner) return;
    if(!ev || !ev.id){
      eventBanner.className = "event-banner";
      eventBanner.innerHTML = '<span class="event-empty">Waiting for comments...</span>';
      return;
    }

    var name = ev.displayName || "Someone";
    var country = ev.countryName || "";
    var flag = ev.flag || "";
    var points = Number(ev.points || 0);
    var av = safeAvatar(ev.profileImageUrl);

    var avatarHTML = av
      ? '<img class="avatar-mini" src="' + esc(av) + '" alt="">'
      : "";

    if(ev.type === "superchat"){
      var usd = Number(ev.amount || 0);
      var cur = ev.currency || "USD";
      eventBanner.className = "event-banner superchat";
      eventBanner.innerHTML =
        '💎 ' + avatarHTML +
        '<span class="name">' + esc(name) + '</span> sent ' +
        '<strong>' + usd.toFixed(2) + ' ' + esc(cur) + '</strong> · ' +
        '<span class="points">' + fmtNumber(points) + ' POINTS</span>' +
        (country ? ' · <span class="country">' + esc(flag) + ' ' + esc(country) + '</span>' : '');
      return;
    }

    eventBanner.className = "event-banner";
    if(points > 0){
      eventBanner.innerHTML =
        '💬 ' + avatarHTML +
        '<span class="name">' + esc(name) + '</span>' +
        (country ? ' · <span class="country">' + esc(flag) + ' ' + esc(country) + '</span>' : '') +
        ' · <span class="points">+' + fmtNumber(points) + ' POINT</span>';
    } else {
      eventBanner.innerHTML =
        '💬 ' + avatarHTML +
        '<span class="name">' + esc(name) + '</span> commented';
    }
  }

  /* ---------- Render: Connection ---------- */

  function renderConnection(connected){
    if(!connectionEl) return;
    if(connected){
      connectionEl.textContent = "🟢 YOUTUBE CONNECTED";
      connectionEl.classList.add("connected");
      connectionEl.classList.remove("error");
    } else {
      connectionEl.textContent = "🔴 YOUTUBE DISCONNECTED";
      connectionEl.classList.remove("connected");
      connectionEl.classList.add("error");
    }
  }

  /* ---------- Placeholder for initial render ---------- */

  function buildPlaceholderCountries(){
    var placeholder = [];
    for(var i = 0; i < 195; i++){
      placeholder.push({ countryName: "Country " + (i + 1), flag: "🏳️", score: 0 });
    }
    return placeholder;
  }

  function initialRender(){
    renderTopPlayers([]);
    renderTopCountries([]);
    renderCountryGrid(buildPlaceholderCountries());
    renderEventBanner(null);
  }

  /* ---------- Fetch state ---------- */

  function fetchState(){
    if(fetching) return;
    fetching = true;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/state?t=" + Date.now(), true);
    xhr.timeout = 10000;

    xhr.onreadystatechange = function(){
      if(xhr.readyState !== 4) return;
      fetching = false;

      if(xhr.status < 200 || xhr.status >= 300){
        renderConnection(false);
        return;
      }

      try{
        var data = JSON.parse(xhr.responseText);

        if(data.voiceLang) voiceLang = data.voiceLang;
        renderConnection(data.connected === true);

        if(data.countries && data.countries.length){
          masterCountries = data.countries;
          renderCountryGrid(data.countries);
          renderTopCountries(data.topCountries || data.countries);
        }

        renderTopPlayers(data.topPlayers || data.players || []);

        var ev = data.lastEvent || null;
        if(ev){
          renderEventBanner(ev);
          announceEvent(ev);
        } else {
          renderEventBanner(null);
        }

        firstLoadDone = true;
      }catch(e){
        console.error("Parse error:", e);
        renderConnection(false);
      }
    };

    xhr.ontimeout = function(){ fetching = false; renderConnection(false); };
    xhr.onerror   = function(){ fetching = false; renderConnection(false); };

    xhr.send();
  }

  /* ---------- Boot ---------- */

  function boot(){
    try{
      console.log("BOOT starting");
      initialRender();
      console.log("BOOT: initial render done");

      window.addEventListener("load", function(){
        setTimeout(startMusic, 600);
      });

      setInterval(fetchState, 2000);
      fetchState();
    }catch(e){
      var eb = document.getElementById("errorBanner");
      if(eb){
        eb.style.display = "block";
        eb.textContent = "BOOT ERROR: " + e.message;
      }
      console.error("BOOT ERROR:", e);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
