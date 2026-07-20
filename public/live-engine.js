/* ColarisLiveEngine: shared real-data fetch + scoring, used by Simulasi Desktop, Mobile Demo,
   and the standalone Live Analysis tool to add a live-analyzed asset (address in) alongside
   the fictional demo portfolio. */
(function (global) {
  "use strict";

  // Set your own free key from https://firms.modaps.eosdis.nasa.gov/api/area/ to enable the
  // Fire Hotspot Engine (NASA FIRMS). Left empty by default: the engine reports "not configured"
  // instead of failing, and every other engine keeps working normally.
  const FIRMS_MAP_KEY = "5bae915cb040c14f14fb39e30486981f";

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function fetchJson(url, opts, timeoutMs) {
    timeoutMs = timeoutMs || 20000;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    return fetch(url, Object.assign({}, opts, { signal: ctl.signal }))
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .finally(() => clearTimeout(t));
  }

  function fetchText(url, opts, timeoutMs) {
    timeoutMs = timeoutMs || 20000;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    return fetch(url, Object.assign({}, opts, { signal: ctl.signal }))
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .finally(() => clearTimeout(t));
  }

  // overpass-api.de (the default public instance) is frequently overloaded/rate-limited.
  // Try a short list of known CORS-enabled mirrors in sequence before giving up.
  const OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
  ];
  async function fetchOverpass(query, onAttempt) {
    let lastErr = null;
    for (const url of OVERPASS_MIRRORS) {
      try {
        if (onAttempt) onAttempt(url);
        return await fetchJson(url, {
          method: "POST", body: "data=" + encodeURIComponent(query),
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }, 15000);
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Semua mirror Overpass gagal");
  }

  async function geocodeSearch(query) {
    const data = await fetchJson(
      "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(query) +
      "&format=json&limit=5&countrycodes=id&addressdetails=1"
    );
    return data.map(d => ({
      lat: parseFloat(d.lat), lon: parseFloat(d.lon),
      label: d.display_name.split(",").slice(0, 2).join(","),
      full: d.display_name,
    }));
  }

  // World Bank Open Data: national GDP growth + inflation for Indonesia. No API key needed.
  async function fetchEconomicIndicators() {
    const [gdp, cpi] = await Promise.all([
      fetchJson("https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=10"),
      fetchJson("https://api.worldbank.org/v2/country/IDN/indicator/FP.CPI.TOTL.ZG?format=json&per_page=10"),
    ]);
    const latestGdp = ((gdp && gdp[1]) || []).find(d => d.value != null);
    const latestCpi = ((cpi && cpi[1]) || []).find(d => d.value != null);
    return {
      gdpGrowth: latestGdp ? latestGdp.value : null,
      gdpYear: latestGdp ? latestGdp.date : null,
      inflation: latestCpi ? latestCpi.value : null,
      inflationYear: latestCpi ? latestCpi.date : null,
    };
  }

  // BMKG: Indonesia's official recent significant earthquakes feed (nationwide, no key).
  // Filtered client-side to quakes within ~300km of the asset (feed itself has no lat/lon filter).
  async function fetchBMKGQuakes(lat, lon) {
    const d = await fetchJson("https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json");
    const list = (d && d.Infogempa && d.Infogempa.gempa) || [];
    return list.map(g => {
      const parts = (g.Coordinates || "0,0").split(",").map(parseFloat);
      const dist = haversine(lat, lon, parts[0], parts[1]);
      return { mag: parseFloat(g.Magnitude), place: g.Wilayah, date: g.Tanggal, jam: g.Jam,
               depth: g.Kedalaman, dist, felt: g.Dirasakan || "-" };
    }).filter(q => !isNaN(q.mag) && !isNaN(q.dist));
  }

  // Open-Meteo Air Quality: PM2.5, PM10 and US AQI at the point. Same provider as weather,
  // no separate key needed.
  async function fetchAirQuality(lat, lon) {
    const d = await fetchJson(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi`);
    const c = d && d.current;
    return { pm25: c ? c.pm2_5 : null, pm10: c ? c.pm10 : null, aqi: c ? c.us_aqi : null };
  }

  // NASA POWER climatology (multi-year monthly/annual averages, no date range needed, no key).
  // Used as an agricultural-viability proxy, most relevant for Lahan/perkebunan collateral.
  async function fetchAgroClimatology(lat, lon) {
    const d = await fetchJson(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M,RH2M,WS2M&community=AG&longitude=${lon}&latitude=${lat}&format=JSON`);
    const p = d && d.properties && d.properties.parameter;
    const ann = (obj) => (obj && obj.ANN != null && obj.ANN !== -999) ? obj.ANN : null;
    return {
      solarRad: p ? ann(p.ALLSKY_SFC_SW_DWN) : null,
      temp: p ? ann(p.T2M) : null,
      humidity: p ? ann(p.RH2M) : null,
      wind: p ? ann(p.WS2M) : null,
    };
  }

  // GDELT's DOC 2.0 API does not reliably send CORS headers for direct browser fetch, which
  // shows up as a generic "Load failed"/"Failed to fetch" error. Try a direct call first, then
  // fall back to a public CORS proxy that just relays the response with proper headers added.
  const CORS_PROXIES = [
    (url) => url, // try direct first (works fine from some networks/browsers)
    (url) => "https://corsproxy.io/?url=" + encodeURIComponent(url),
    (url) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
  ];
  async function fetchViaCorsProxy(url, timeoutMs) {
    let lastErr = null;
    for (const wrap of CORS_PROXIES) {
      try { return await fetchJson(wrap(url), {}, timeoutMs || 12000); }
      catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Semua proxy CORS gagal");
  }

  // GDELT Project (Global Database of Events, Language, and Tone): recent news volume and
  // average tone/sentiment for a place name. No API key needed. Tone is GDELT's own linguistic
  // scoring (roughly -10 very negative to +10 very positive), not an LLM summary. The article
  // list and tone timeline are fetched independently, so if one fails the other can still return.
  async function fetchMediaSentiment(placeName) {
    const q = encodeURIComponent(`"${placeName}"`);
    const artUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=10&timespan=30d&format=json&sort=hybridrel`;
    const toneUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=timelinetone&timespan=30d&format=json`;

    const [artResult, toneResult] = await Promise.allSettled([
      fetchViaCorsProxy(artUrl, 15000),
      fetchViaCorsProxy(toneUrl, 15000),
    ]);

    if (artResult.status === "rejected" && toneResult.status === "rejected") {
      throw new Error("GDELT tidak dapat diakses (CORS/jaringan)");
    }

    const artData = artResult.status === "fulfilled" ? artResult.value : null;
    const toneData = toneResult.status === "fulfilled" ? toneResult.value : null;

    const articles = (artData && artData.articles) || [];
    let avgTone = null;
    try {
      const series = toneData && toneData.timeline && toneData.timeline[0] && toneData.timeline[0].data;
      if (series && series.length) {
        const vals = series.map(d => d.value).filter(v => typeof v === "number");
        if (vals.length) avgTone = vals.reduce((a, b) => a + b, 0) / vals.length;
      }
    } catch (e) {}
    return {
      articleCount: artData ? articles.length : null,
      avgTone,
      topArticles: articles.slice(0, 5).map(a => ({ title: a.title, domain: a.domain, date: a.seendate })),
      partial: artResult.status === "rejected" || toneResult.status === "rejected",
    };
  }

  // NASA FIRMS: active fire hotspots (VIIRS, last 3 days) in a ~30km box around the point.
  // Requires a free MAP_KEY (see constant above); reports "not configured" otherwise.
  async function fetchFireHotspots(lat, lon) {
    if (!FIRMS_MAP_KEY) return { configured: false, count: null };
    const d2 = 0.15; // ~15-17km at Indonesia's latitude
    const bbox = `${lon - d2},${lat - d2},${lon + d2},${lat + d2}`;
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/${bbox}/3`;
    const text = await fetchText(url, {}, 15000);
    const lines = text.trim().split("\n").filter(Boolean);
    const rows = lines.slice(1); // drop CSV header
    if (lines[0] && lines[0].toLowerCase().indexOf("invalid") >= 0) throw new Error("MAP_KEY tidak valid");
    return { configured: true, count: rows.length };
  }

  // Pulls all live signals for a coordinate. Never throws: each engine fails independently,
  // onStep(key, state, note) reports progress for UI, R fields stay null on failure.
  async function fetchLiveSignals(lat, lon, onStep, placeName) {
    const step = (k, s, n) => { if (onStep) try { onStep(k, s, n); } catch (e) {} };
    const R = { elev: null, rain30: null, rain7f: null, discharge: null, dischargeRatio: null,
                quakes: [], waterwayM: null, roads: null, shops: null,
                gdpGrowth: null, gdpYear: null, inflation: null, inflationYear: null,
                bmkgQuakes: [], fireCount: null, fireConfigured: false,
                pm25: null, pm10: null, aqi: null,
                solarRad: null, agroTemp: null, humidity: null, wind: null,
                schools: null, healthcare: null, transit: null, powerInfra: null,
                mediaArticles: null, mediaTone: null, mediaTop: [] };

    step("elev", "loading");
    try {
      const d = await fetchJson(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`);
      R.elev = d.elevation && d.elevation[0];
      step("elev", "done", `Elevasi ${R.elev == null ? "n/a" : R.elev + " m dpl"}`);
    } catch (e) { step("elev", "fail", "Elevation Engine gagal"); }

    step("rain", "loading");
    try {
      const d = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&past_days=31&forecast_days=7&timezone=auto`);
      const arr = d.daily.precipitation_sum.map(v => v == null ? 0 : v);
      const past = arr.slice(0, 31), future = arr.slice(31);
      R.rain30 = past.reduce((a, b) => a + b, 0);
      R.rain7f = future.reduce((a, b) => a + b, 0);
      step("rain", "done", `Hujan 30 hari ${R.rain30.toFixed(0)} mm`);
    } catch (e) { step("rain", "fail", "Climate Engine gagal"); }

    step("flood", "loading");
    try {
      const d = await fetchJson(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&past_days=31&forecast_days=1`);
      const arr = (d.daily.river_discharge || []).filter(v => v != null);
      if (arr.length) {
        R.discharge = arr[arr.length - 1];
        const mx = Math.max(...arr);
        R.dischargeRatio = mx > 0 ? R.discharge / mx : 0;
      }
      step("flood", "done", R.discharge == null ? "Tidak ada sungai GloFAS terdekat" : `Debit sungai ${(R.dischargeRatio*100).toFixed(0)}% dari puncak`);
    } catch (e) { step("flood", "fail", "Flood Engine gagal"); }

    step("air", "loading");
    try {
      const aq = await fetchAirQuality(lat, lon);
      R.pm25 = aq.pm25; R.pm10 = aq.pm10; R.aqi = aq.aqi;
      step("air", "done", `PM2.5 ${aq.pm25 != null ? aq.pm25.toFixed(0) + " ug/m3" : "n/a"}, US AQI ${aq.aqi != null ? aq.aqi : "n/a"}`);
    } catch (e) { step("air", "fail", "Air Quality Engine gagal"); }

    step("quake", "loading");
    try {
      const start = new Date(); start.setFullYear(start.getFullYear() - 10);
      const d = await fetchJson(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=150&starttime=${start.toISOString().slice(0,10)}&minmagnitude=5&orderby=magnitude&limit=50`);
      R.quakes = (d.features || []).map(f => ({ mag: f.properties.mag, place: f.properties.place, time: f.properties.time }));
      step("quake", "done", `${R.quakes.length} gempa M>=5 / 10 thn (USGS)`);
    } catch (e) { step("quake", "fail", "Seismic Engine (USGS) gagal"); }

    step("bmkg", "loading");
    try {
      const all = await fetchBMKGQuakes(lat, lon);
      R.bmkgQuakes = all.filter(q => q.dist <= 300);
      step("bmkg", "done", `${R.bmkgQuakes.length} gempa terkini BMKG dalam 300 km`);
    } catch (e) { step("bmkg", "fail", "BMKG Engine gagal (CORS/jaringan)"); }

    step("econ", "loading");
    try {
      const econ = await fetchEconomicIndicators();
      R.gdpGrowth = econ.gdpGrowth; R.gdpYear = econ.gdpYear;
      R.inflation = econ.inflation; R.inflationYear = econ.inflationYear;
      step("econ", "done", `PDB ${econ.gdpGrowth!=null?econ.gdpGrowth.toFixed(1)+"%":"n/a"} (${econ.gdpYear}), inflasi ${econ.inflation!=null?econ.inflation.toFixed(1)+"%":"n/a"} (${econ.inflationYear})`);
    } catch (e) { step("econ", "fail", "Economic Engine (World Bank) gagal"); }

    step("media", "loading");
    try {
      if (!placeName) throw new Error("nama lokasi tidak tersedia");
      const media = await fetchMediaSentiment(placeName);
      R.mediaArticles = media.articleCount; R.mediaTone = media.avgTone; R.mediaTop = media.topArticles;
      const partialNote = media.partial ? " (sebagian data)" : "";
      step("media", "done", media.articleCount === 0
        ? `Tidak ada artikel ditemukan untuk "${placeName}" dalam 30 hari (GDELT)${partialNote}`
        : `${media.articleCount != null ? media.articleCount : "?"} artikel, tone rata-rata ${media.avgTone != null ? media.avgTone.toFixed(2) : "n/a"} (GDELT, 30 hari)${partialNote}`);
    } catch (e) { step("media", "fail", "Media Intelligence Engine (GDELT) gagal: " + e.message); }

    step("fire", "loading");
    try {
      const fire = await fetchFireHotspots(lat, lon);
      R.fireConfigured = fire.configured; R.fireCount = fire.count;
      step("fire", fire.configured ? "done" : "skip",
        fire.configured ? `${fire.count} titik api NASA FIRMS (3 hari, radius ~15km)` : "Fire Hotspot Engine: MAP_KEY belum dikonfigurasi");
    } catch (e) { step("fire", "fail", "Fire Hotspot Engine gagal: " + e.message); }

    step("agri", "loading");
    try {
      const agro = await fetchAgroClimatology(lat, lon);
      R.solarRad = agro.solarRad; R.agroTemp = agro.temp; R.humidity = agro.humidity; R.wind = agro.wind;
      step("agri", "done", `Radiasi surya ${agro.solarRad!=null?agro.solarRad.toFixed(1)+" kWh/m2/hari":"n/a"}, suhu rata-rata ${agro.temp!=null?agro.temp.toFixed(1)+"C":"n/a"}`);
    } catch (e) { step("agri", "fail", "Agro Climatology Engine (NASA POWER) gagal"); }

    step("osm", "loading");
    try {
      const q = `[out:json][timeout:20];(way(around:500,${lat},${lon})["waterway"~"river|canal|stream"];way(around:600,${lat},${lon})["highway"~"motorway|trunk|primary|secondary"];node(around:1000,${lat},${lon})["shop"];node(around:1000,${lat},${lon})["amenity"~"bank|marketplace|atm"];node(around:1500,${lat},${lon})["amenity"~"school|university|college"];node(around:2000,${lat},${lon})["amenity"~"hospital|clinic|doctors"];node(around:800,${lat},${lon})["highway"~"bus_stop"];node(around:800,${lat},${lon})["railway"~"station|halt"];way(around:600,${lat},${lon})["power"~"substation|line|tower"];);out center 500;`;
      const d = await fetchOverpass(q, (url) => step("osm", "loading", `Mencoba ${new URL(url).hostname}...`));
      let minW = null, roads = 0, shops = 0, schools = 0, healthcare = 0, transit = 0, powerInfra = 0;
      (d.elements || []).forEach(el => {
        const t = el.tags || {};
        if (t.waterway) {
          const c = el.center || el;
          if (c.lat != null) { const dist = haversine(lat, lon, c.lat, c.lon) * 1000; if (minW == null || dist < minW) minW = dist; }
        } else if (t.highway === "bus_stop") { transit++; }
        else if (t.railway) { transit++; }
        else if (t.highway) { roads++; }
        else if (t.amenity === "school" || t.amenity === "university" || t.amenity === "college") { schools++; }
        else if (t.amenity === "hospital" || t.amenity === "clinic" || t.amenity === "doctors") { healthcare++; }
        else if (t.power) { powerInfra++; }
        else if (t.shop || t.amenity) { shops++; }
      });
      R.waterwayM = minW; R.roads = roads; R.shops = shops;
      R.schools = schools; R.healthcare = healthcare; R.transit = transit; R.powerInfra = powerInfra;
      step("osm", "done", `${roads} jalan utama, ${shops} titik komersial, ${schools} sekolah, ${healthcare} faskes, ${transit} halte/1km`);
    } catch (e) { step("osm", "fail", "Geo & Market Engine gagal (semua mirror timeout/down), skor memakai nilai netral"); }

    return R;
  }

  // Maps raw signals to the 5-dimension schema used by the desktop/mobile demos
  // (Market / Legal / Geo / Climate / Economic). Climate folds in flood, seismic (USGS + BMKG
  // combined) and fire-hotspot risk; Economic is now computed from World Bank GDP growth and
  // inflation instead of a fixed neutral value.
  function scoreEconomic(gdpGrowth, inflation) {
    let s = 100;
    const notes = [];
    if (gdpGrowth != null) {
      if (gdpGrowth < 2) { s -= 22; notes.push(`Pertumbuhan PDB Indonesia ${gdpGrowth.toFixed(1)}% (melambat)`); }
      else if (gdpGrowth < 4) { s -= 10; }
    }
    if (inflation != null) {
      if (inflation > 6) { s -= 22; notes.push(`Inflasi Indonesia ${inflation.toFixed(1)}% (di atas target BI)`); }
      else if (inflation > 4) { s -= 10; }
    }
    return { score: Math.max(15, Math.min(98, Math.round(s))), notes };
  }

  function scoreFromSignals(R, legalScore) {
    const reasons = [];
    let climate = 100;
    if (R.elev != null) {
      if (R.elev < 5) { climate -= 32; reasons.push(`Elevasi ${R.elev.toFixed(1)} m dpl: sangat rawan rob/genangan`); }
      else if (R.elev < 10) { climate -= 20; reasons.push(`Elevasi ${R.elev.toFixed(1)} m dpl di bawah ambang aman`); }
      else if (R.elev < 20) climate -= 8;
    }
    if (R.rain30 != null) {
      if (R.rain30 > 600) { climate -= 16; reasons.push(`Curah hujan 30 hari ${R.rain30.toFixed(0)} mm (tinggi)`); }
      else if (R.rain30 > 400) climate -= 9;
    }
    if (R.dischargeRatio != null && R.dischargeRatio > 0.8) { climate -= 12; reasons.push(`Debit sungai ${Math.round(R.dischargeRatio*100)}% dari puncak (GloFAS)`); }
    if (R.waterwayM != null) {
      if (R.waterwayM < 150) { climate -= 12; reasons.push(`Sungai/kanal ${R.waterwayM.toFixed(0)} m dari lokasi`); }
      else if (R.waterwayM < 400) climate -= 6;
    }
    const bigQ_usgs = R.quakes.filter(q => q.mag >= 6).length;
    const bigQ_bmkg = (R.bmkgQuakes || []).filter(q => q.mag >= 6 && q.dist <= 150).length;
    const bigQ = Math.max(bigQ_usgs, bigQ_bmkg);
    if (bigQ >= 3) { climate -= 22; reasons.push(`${bigQ} gempa M>=6 dalam 150 km/10 thn (USGS/BMKG)`); }
    else if (bigQ >= 1) { climate -= 13; reasons.push(`${bigQ} gempa M>=6 dalam 150 km (USGS/BMKG)`); }
    else if (R.quakes.length >= 12) climate -= 6;
    if (R.fireConfigured && R.fireCount != null) {
      if (R.fireCount >= 5) { climate -= 12; reasons.push(`${R.fireCount} titik api terdeteksi NASA FIRMS dalam radius ~15km (3 hari terakhir)`); }
      else if (R.fireCount >= 1) climate -= 5;
    }
    if (R.aqi != null) {
      if (R.aqi > 150) { climate -= 15; reasons.push(`Kualitas udara US AQI ${R.aqi} (tidak sehat, Open-Meteo)`); }
      else if (R.aqi > 100) climate -= 7;
    }
    climate = Math.max(5, Math.round(climate));

    let geo = 70;
    if (R.roads != null) {
      if (R.roads >= 8) geo = 92; else if (R.roads >= 3) geo = 82; else if (R.roads >= 1) geo = 72;
      else { geo = 55; reasons.push("Tidak ada jalan arteri/kolektor dalam 600 m (OSM)"); }
    }
    const amenities = (R.schools||0) + (R.healthcare||0) + (R.transit||0);
    if (amenities >= 6) geo = Math.min(96, geo + 8);
    else if (amenities === 0 && R.roads != null) { geo = Math.max(40, geo - 8); reasons.push("Tidak ada sekolah, faskes, atau halte transit dalam radius (OSM)"); }

    let market = 65;
    if (R.shops != null) {
      if (R.shops >= 60) market = 90; else if (R.shops >= 25) market = 82;
      else if (R.shops >= 8) market = 72;
      else { market = 58; reasons.push(`Hanya ${R.shops} titik komersial dalam 1 km (OSM)`); }
    }
    if (R.mediaTone != null) {
      if (R.mediaTone < -3) { market -= 10; reasons.push(`Sentimen media kawasan negatif (GDELT, tone rata-rata ${R.mediaTone.toFixed(1)})`); }
      else if (R.mediaTone < -1) market -= 5;
      else if (R.mediaTone > 3) market = Math.min(96, market + 5);
    }
    market = Math.max(15, Math.min(96, Math.round(market)));

    const econ = scoreEconomic(R.gdpGrowth, R.inflation);
    econ.notes.forEach(n => reasons.push(n));

    if (R.solarRad != null && R.solarRad < 4) {
      reasons.push(`Radiasi surya rata-rata ${R.solarRad.toFixed(1)} kWh/m2/hari (NASA POWER): relevan jika agunan berupa lahan/perkebunan, potensi hasil panen lebih rendah`);
    }

    const floodProne = (R.elev != null && R.elev < 10) || (R.waterwayM != null && R.waterwayM < 400) || (R.dischargeRatio != null && R.dischargeRatio > 0.5);

    const gdpTxt = R.gdpGrowth != null ? `${R.gdpGrowth.toFixed(1)}% (${R.gdpYear}, World Bank)` : "data tidak tersedia";
    const inflTxt = R.inflation != null ? `${R.inflation.toFixed(1)}% (${R.inflationYear}, World Bank)` : "data tidak tersedia";

    return {
      scores: { Market: Math.round(market), Legal: legalScore, Geo: Math.round(geo), Climate: climate, Economic: econ.score },
      floodProne,
      reasons,
      economicNote: `Economic Intelligence: ${econ.score}, dihitung dari pertumbuhan PDB Indonesia ${gdpTxt} dan inflasi ${inflTxt}. Indikator nasional, bukan hyperlocal.`,
    };
  }

  global.ColarisLiveEngine = {
    geocodeSearch, fetchLiveSignals, scoreFromSignals, haversine, fetchJson, fetchText,
    fetchOverpass, fetchEconomicIndicators, fetchBMKGQuakes, fetchFireHotspots,
    fetchAirQuality, fetchAgroClimatology, fetchMediaSentiment,
  };
})(window);
