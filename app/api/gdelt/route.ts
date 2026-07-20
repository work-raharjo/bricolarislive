import { NextRequest, NextResponse } from "next/server";

// Server-side passthrough for GDELT's DOC 2.0 API. GDELT doesn't reliably send CORS headers
// for direct browser fetch, which surfaces as a generic "Load failed" error client-side.
// Fetching it here (server-to-server) sidesteps CORS entirely, since CORS is a browser-only
// restriction and doesn't apply between servers.
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const mode = searchParams.get("mode");
  const timespan = searchParams.get("timespan") || "30d";
  const maxrecords = searchParams.get("maxrecords") || "10";
  const sort = searchParams.get("sort") || "hybridrel";

  if (!query || !mode) {
    return NextResponse.json({ error: "Missing query or mode parameter" }, { status: 400 });
  }

  const gdeltUrl =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}` +
    `&mode=${encodeURIComponent(mode)}&format=json&timespan=${encodeURIComponent(timespan)}` +
    (mode === "artlist" ? `&maxrecords=${encodeURIComponent(maxrecords)}&sort=${encodeURIComponent(sort)}` : "");

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch(gdeltUrl, {
      signal: ctl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json,text/plain,*/*",
      },
    });
    clearTimeout(t);
    if (!res.ok) {
      return NextResponse.json({ error: `GDELT HTTP ${res.status}` }, { status: 502 });
    }
    const text = await res.text();
    // GDELT sometimes returns an empty body or a plain-text error message instead of JSON
    // for queries with no results; treat non-JSON as an empty-but-valid result rather than a hard error.
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(mode === "artlist" ? { articles: [] } : { timeline: [] });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: "GDELT fetch failed: " + message }, { status: 502 });
  }
}
