/* ColarisLiveEngine: shared real-data fetch + scoring, used by Simulasi Desktop and Mobile Demo
   to add a live-analyzed asset (address in) alongside the fictional demo portfolio. */
(function (global) {
  "use strict";

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

  // Pulls all live signals for a coordinate. Never throws: each engine fails independently,
  // onStep(key, state, note) reports progress for UI, R fields stay null on failure.
  async function fetchLiveSignals(lat, lon, onStep) {
    const step = (k, s, n) => { if (onStep) try { onStep(k, s, n); } catch (e) {} };
    const R = { elev: null, rain30: null, rain7f: null, discharge: null, dischargeRatio: null,
                quakes: [], waterwayM: null, roads: null, shops: null };

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

    step("quake", "loading");
    try {
      const start = new Date(); start.setFullYear(start.getFullYear() - 10);
      const d = await fetchJson(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=150&starttime=${start.toISOString().slice(0,10)}&minmagnitude=5&orderby=magnitude&limit=50`);
      R.quakes = (d.features || []).map(f => ({ mag: f.properties.mag, place: f.properties.place, time: f.properties.time }));
      step("quake", "done", `${R.quakes.length} gempa M>=5 / 10 thn`);
    } catch (e) { step("quake", "fail", "Seismic Engine gagal"); }

    step("osm", "loading");
    try {
      const q = `[out:json][timeout:20];(way(around:500,${lat},${lon})["waterway"~"river|canal|stream"];way(around:600,${lat},${lon})["highway"~"motorway|trunk|primary|secondary"];node(around:1000,${lat},${lon})["shop"];node(around:1000,${lat},${lon})["amenity"~"bank|marketplace|atm"];);out center 400;`;
      const d = await fetchOverpass(q, (url) => step("osm", "loading", `Mencoba ${new URL(url).hostname}...`));
      let minW = null, roads = 0, shops = 0;
      (d.elements || []).forEach(el => {
        if (el.tags && el.tags.waterway) {
          const c = el.center || el;
          if (c.lat != null) { const dist = haversine(lat, lon, c.lat, c.lon) * 1000; if (minW == null || dist < minW) minW = dist; }
        } else if (el.tags && el.tags.highway) { roads++; }
        else if (el.tags && (el.tags.shop || el.tags.amenity)) { shops++; }
      });
      R.waterwayM = minW; R.roads = roads; R.shops = shops;
      step("osm", "done", `${roads} jalan utama, ${shops} titik komersial/1km`);
    } catch (e) { step("osm", "fail", "Geo & Market Engine gagal (semua mirror timeout/down), skor memakai nilai netral"); }

    return R;
  }

  // Maps raw signals to the 5-dimension schema used by the desktop/mobile demos
  // (Market / Legal / Geo / Climate / Economic). Climate folds in both flood and seismic
  // risk, matching how those demos already describe Climate as "risiko lingkungan & bencana".
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
    const bigQ = R.quakes.filter(q => q.mag >= 6).length;
    if (bigQ >= 3) { climate -= 22; reasons.push(`${bigQ} gempa M>=6 tercatat USGS dalam 150 km/10 thn`); }
    else if (bigQ >= 1) { climate -= 13; reasons.push(`${bigQ} gempa M>=6 dalam 150 km (USGS)`); }
    else if (R.quakes.length >= 12) climate -= 6;
    climate = Math.max(5, Math.round(climate));

    let geo = 70;
    if (R.roads != null) {
      if (R.roads >= 8) geo = 92; else if (R.roads >= 3) geo = 82; else if (R.roads >= 1) geo = 72;
      else { geo = 55; reasons.push("Tidak ada jalan arteri/kolektor dalam 600 m (OSM)"); }
    }

    let market = 65;
    if (R.shops != null) {
      if (R.shops >= 60) market = 90; else if (R.shops >= 25) market = 82;
      else if (R.shops >= 8) market = 72;
      else { market = 58; reasons.push(`Hanya ${R.shops} titik komersial dalam 1 km (OSM)`); }
    }

    const floodProne = (R.elev != null && R.elev < 10) || (R.waterwayM != null && R.waterwayM < 400) || (R.dischargeRatio != null && R.dischargeRatio > 0.5);

    return {
      scores: { Market: Math.round(market), Legal: legalScore, Geo: Math.round(geo), Climate: climate, Economic: 70 },
      floodProne,
      reasons,
      economicNote: "Economic Intelligence: 70 (estimasi netral, data makroekonomi lokal real-time belum tersedia via API publik).",
    };
  }

  global.ColarisLiveEngine = { geocodeSearch, fetchLiveSignals, scoreFromSignals, haversine, fetchJson, fetchOverpass };
})(window);
