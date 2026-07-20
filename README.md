# BRI COLARIS Live

Real-time collateral risk analysis demos for BRI's EMBRIO 2026 innovation proposal (COLARIS: Collateral Risk Intelligence System).

## Structure

- `/` - landing page linking to all three demos, plus team credits
- `/live` - standalone Live Analysis tool: input any real Indonesian address, get a full risk breakdown from live public data
- `/simulasi` - the desktop portfolio dashboard (dummy baseline data), now with a "+ Tambah Agunan (Data Real)" button that adds a live-analyzed asset alongside the dummy ones
- `/mobile` - the mobile app demo (dummy baseline data), now with a "Tambah Agunan" quick action that does the same
- `/docs` - full documentation: data source table, workflow explanation, Recovery Probability formula (see below), and honestly-stated limitations
- `/api/gdelt` - a small server-side API route (edge runtime) that proxies GDELT requests; see "Why a backend route?" below

## 11 live data engines

`public/live-engine.js` is loaded by all three demo HTML files and centralizes:

| Engine | Source | Key needed? |
|---|---|---|
| Geocoding | OpenStreetMap Nominatim | No |
| Elevation | Open-Meteo | No |
| Climate (rainfall) | Open-Meteo | No |
| Flood | Open-Meteo GloFAS | No |
| Air Quality | Open-Meteo | No |
| Seismic (historical) | USGS | No |
| Seismic (recent, Indonesia) | BMKG | No |
| Economic | World Bank Open Data | No |
| Media Intelligence | GDELT Project | No |
| Fire Hotspot | NASA FIRMS | Yes (free, already configured) |
| Agro Climatology | NASA POWER | No |
| Geo & Market | Overpass/OSM (roads, schools, healthcare, transit, power infra, commercial density) | No |

Legal status (SHM/SHGB/etc.) and market value remain manual inputs, since land-title data (BPN) and property-transaction data aren't available as public APIs in Indonesia.

## Recovery Probability: Basel-inspired haircut model

Recovery Probability isn't a fixed percentage; it's derived from a haircut model structured the way Basel actually approaches LGD (Loss Given Default):

```
Haircut Total = (1 - Faktor Likuiditas) x 100        <- collateral-type base haircut
              + (100 - Skor Legal) x 0.25             <- legal-certainty addon (Basel requires this)
              + Collateral Risk Index x 0.35           <- risk/volatility overlay

Recovery Probability = clamp(15%, 97%, 100 - Haircut Total)
```

Full explanation, worked example, and why this approach was chosen over a plain ad-hoc formula: see the `/docs` page ("Cara Menghitung Recovery Probability" and "Kenapa Pakai Pendekatan Basel?").

## Why a backend route?

Everything in this app is client-side except one thing: GDELT's API doesn't reliably send CORS headers for direct browser requests, which surfaces as a generic "Load failed" error. Since CORS is a browser-only restriction, `app/api/gdelt/route.ts` fetches GDELT server-side (Vercel edge function) and relays the result same-origin, eliminating the failure mode entirely. If that route is ever unavailable (e.g. the standalone downloadable HTML file, opened with no server behind it), the client falls back to a best-effort public CORS-proxy chain.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repo on [Vercel](https://vercel.com/new). Next.js is auto-detected, no config needed.
