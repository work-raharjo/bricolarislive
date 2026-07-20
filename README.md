# BRI COLARIS Live

Real-time collateral risk analysis demo for BRI's EMBRIO 2026 innovation proposal (COLARIS — Collateral Risk Intelligence System).

Unlike the main proposal demos (which use fictional data), this app lets you **input any real address in Indonesia** and computes a live Collateral Risk Index from actual public data pulled at request time:

| Engine | Source | Data |
|---|---|---|
| Geocoding | OpenStreetMap Nominatim | Address to coordinates |
| Elevation | Open-Meteo | Elevation at the exact point (flood-proxy) |
| Climate | Open-Meteo | Actual 30-day rainfall + 7-day forecast |
| Flood | Open-Meteo GloFAS | River discharge vs. 30-day peak |
| Seismic | USGS | M5+ earthquakes within 150 km, last 10 years |
| Geo & Market | Overpass (OSM) | Distance to nearest river, arterial road access, commercial density (liquidity proxy) |

Legal status is left as manual input (SHM/SHGB/etc.) since land-title data (BPN) isn't publicly queryable. Market value is also a manual input, since there's no public Indonesian property-transaction API.

All computation happens client-side in a single static HTML file (`public/demos/live.html`); the Next.js app just serves it full-viewport. No backend, no API keys, no database.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repo on [Vercel](https://vercel.com/new) - Next.js is auto-detected, no config needed.
