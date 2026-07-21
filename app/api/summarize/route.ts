import { NextRequest, NextResponse } from "next/server";

// Intelligence Fusion Engine: the LLM layer described in the original COLARIS proposal
// ("Intelligence Fusion memanfaatkan Large Language Model untuk memahami berita, regulasi,
// dan informasi tidak terstruktur"). This is distinct from the Media Intelligence Engine
// (GDELT), which only gathers structured article counts/tone. This route takes those
// article titles and asks an LLM to genuinely read and summarize them, server-side, so the
// API key never touches client code.
export const runtime = "edge";

const SUMOPOD_API_KEY = process.env.SUMOPOD_API_KEY;
const SUMOPOD_MODEL = process.env.SUMOPOD_MODEL || "gemini/gemini-2.5-flash";

interface ArticleInput {
  title?: string;
  domain?: string;
}

export async function POST(req: NextRequest) {
  if (!SUMOPOD_API_KEY) {
    return NextResponse.json({ error: "SUMOPOD_API_KEY not configured" }, { status: 501 });
  }

  let body: { placeName?: string; articles?: ArticleInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const placeName = body.placeName;
  const articles = Array.isArray(body.articles) ? body.articles : [];
  if (!placeName) {
    return NextResponse.json({ error: "Missing placeName" }, { status: 400 });
  }

  const articleList = articles
    .slice(0, 8)
    .map((a, i) => `${i + 1}. ${a.title || "(tanpa judul)"} (${a.domain || "sumber tidak diketahui"})`)
    .join("\n");

  const prompt = articles.length
    ? `Berikut judul-judul berita tentang "${placeName}" dari 30 hari terakhir:\n${articleList}\n\n` +
      `Ringkas dalam maksimal 2 kalimat bahasa Indonesia: apa tema utama pemberitaan di kawasan ini, ` +
      `dan apakah ada indikasi yang relevan untuk risiko agunan properti (misalnya pembangunan, ` +
      `bencana, keamanan, sengketa lahan, atau perkembangan ekonomi lokal). Jawab singkat dan faktual ` +
      `berdasarkan judul yang diberikan saja, jangan mengarang informasi yang tidak tersirat dari judul.`
    : `Tidak ada artikel berita ditemukan untuk "${placeName}" dalam 30 hari terakhir. ` +
      `Balas dengan satu kalimat singkat bahwa tidak ada sinyal media yang signifikan untuk kawasan ini.`;

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    const res = await fetch("https://ai.sumopod.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUMOPOD_API_KEY}`,
      },
      body: JSON.stringify({
        model: SUMOPOD_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 220,
        temperature: 0.3,
      }),
      signal: ctl.signal,
    });
    clearTimeout(t);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `SumoPod HTTP ${res.status}: ${text.slice(0, 300)}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ error: "Empty response from LLM" }, { status: 502 });
    }
    return NextResponse.json({ summary, model: SUMOPOD_MODEL });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: "LLM fetch failed: " + message }, { status: 502 });
  }
}
