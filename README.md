# BRI COLARIS

Real-time collateral risk analysis demos for BRI's EMBRIO 2026 innovation proposal (COLARIS: Collateral Risk Intelligence System).

## Structure

- `/` - landing page linking to all three demos, plus team credits
- `/live` - standalone Live Analysis tool: input any real Indonesian address, get a full risk breakdown from live public data
- `/simulasi` - the desktop portfolio dashboard (dummy baseline data), now with a "+ Tambah Agunan (Data Real)" button that adds a live-analyzed asset alongside the dummy ones
- `/mobile` - the mobile app demo (dummy baseline data), now with a "Tambah Agunan" quick action that does the same
- `/docs` - full documentation: data source table, workflow explanation, why the two backend routes exist, Recovery Probability formula, and honestly-stated limitations

## 12 live data engines

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
| Intelligence Fusion | LLM via SumoPod (OpenAI-compatible gateway) | Yes (server-side only, see below) |
| Fire Hotspot | NASA FIRMS | Yes (free, already configured) |
| Agro Climatology | NASA POWER | No |
| Geo & Market | Overpass/OSM (roads, schools, healthcare, transit, power infra, commercial density) | No |

Legal status (SHM/SHGB/etc.) and market value remain manual inputs, since land-title data (BPN) and property-transaction data aren't available as public APIs in Indonesia.

Media Intelligence (GDELT) gathers structured article counts and tone/sentiment scores. Intelligence Fusion is a separate, distinct engine on top of it: it genuinely reads the article titles GDELT found and asks an LLM to summarize them in 1-2 sentences, matching the original proposal's description of "Intelligence Fusion memanfaatkan Large Language Model untuk memahami berita ... dan informasi tidak terstruktur."

## Recovery Probability: Basel-inspired haircut model

Recovery Probability is derived from a haircut model structured the way Basel actually approaches LGD (Loss Given Default):

```
Haircut Total = (1 - Faktor Likuiditas) x 100        <- collateral-type base haircut
              + (100 - Skor Legal) x 0.25             <- legal-certainty addon (Basel requires this)
              + Collateral Risk Index x 0.35           <- risk/volatility overlay

Recovery Probability = clamp(15%, 97%, 100 - Haircut Total)
```

Full explanation, worked example, and why this approach was chosen: see the `/docs` page.

## Why two backend routes?

Almost everything in this app runs purely client-side. Two small exceptions, both for the same underlying reason (CORS):

- **`app/api/gdelt/route.ts`**: GDELT's API doesn't reliably send CORS headers for direct browser requests, which surfaces as a generic "Load failed" error. Since CORS is a browser-only restriction, this route fetches GDELT server-side (Vercel edge function) and relays the result same-origin, eliminating the failure mode entirely. If unavailable (e.g. the standalone downloadable HTML file with no backend), the client falls back to a best-effort public CORS-proxy chain.
- **`app/api/summarize/route.ts`**: calls an LLM (via SumoPod, an OpenAI-compatible gateway) for the Intelligence Fusion engine. The LLM API key is stored server-side only (`SUMOPOD_API_KEY` environment variable) and never touches client code, so it can't be read via "view source".

Set these environment variables in your Vercel project (Settings -> Environment Variables) to enable them in production:

```
SUMOPOD_API_KEY=<your key>
SUMOPOD_MODEL=gemini/gemini-2.5-flash   # optional, this is the default
```

If either route is unavailable or misconfigured, the corresponding engine reports "not configured" or falls back gracefully; the rest of the analysis is unaffected.

## Run locally

```bash
npm install
npm run dev
```

Create a `.env.local` file (gitignored) with `SUMOPOD_API_KEY` if you want Intelligence Fusion to work locally.

## Deploy

Import this repo on [Vercel](https://vercel.com/new). Next.js is auto-detected, no config needed. Remember to add the environment variables above in the Vercel project settings.
