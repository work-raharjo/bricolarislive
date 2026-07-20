# BRI COLARIS Live

Real-time collateral risk analysis demos for BRI's EMBRIO 2026 innovation proposal (COLARIS: Collateral Risk Intelligence System).

## Structure

- `/` - landing page linking to all three demos
- `/live` - standalone Live Analysis tool: input any real Indonesian address, get a full risk breakdown from live public data
- `/simulasi` - the desktop portfolio dashboard (fictional baseline data), now with a "+ Tambah Agunan (Data Real)" button that adds a live-analyzed asset alongside the fictional ones
- `/mobile` - the mobile app demo (fictional baseline data), now with a "Tambah Agunan" quick action that does the same

## Shared live-data engine

`public/live-engine.js` is loaded by all three demo HTML files. It centralizes:

- **Geocoding**: OpenStreetMap Nominatim (address to coordinates)
- **Elevation**: Open-Meteo (flood-risk proxy)
- **Climate**: Open-Meteo (actual 30-day rainfall + 7-day forecast)
- **Flood**: Open-Meteo GloFAS (river discharge vs. 30-day peak)
- **Seismic**: USGS (M5+ earthquakes within 150 km, last 10 years)
- **Geo & Market**: Overpass/OSM (distance to nearest river, arterial road access, commercial density as a liquidity proxy)

Legal status (SHM/SHGB/etc.) and market value are manual inputs, since land-title data (BPN) and property-transaction data aren't available as public APIs in Indonesia.

All computation happens client-side, no backend, no API keys, no database.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Import this repo on [Vercel](https://vercel.com/new). Next.js is auto-detected, no config needed.
