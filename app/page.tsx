import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(1200px 600px at 70% -10%, #12406F 0%, transparent 60%), linear-gradient(160deg,#071E38,#0B2C52 60%,#071E38)",
        color: "#CBDCF2",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "56px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 920 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34 }}>
          <Image src="/bri-logo-white.png" alt="BRI" width={78} height={31} />
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,.25)" }} />
          <div style={{ lineHeight: 1.1 }}>
            <b style={{ fontSize: 19, color: "#fff", letterSpacing: 0.5 }}>COLARIS</b>
            <div style={{ fontSize: 10, color: "#BFD6EE", letterSpacing: 2 }}>
              REAL-DATA COLLATERAL RISK INTELLIGENCE
            </div>
          </div>
          <Link
            href="/docs"
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: "bold",
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.18)",
              borderRadius: 99,
              padding: "7px 14px",
            }}
          >
            📄 Dokumentasi
          </Link>
        </div>

        <div style={{ fontSize: 11, letterSpacing: 2, color: "#F7A468", fontWeight: "bold" }}>
          EMBRIO 2026 · PROPOSAL INOVASI
        </div>
        <h1 style={{ fontSize: 30, color: "#fff", margin: "10px 0 14px", lineHeight: 1.3 }}>
          BRI COLARIS: dari dummy data ke data publik real-time
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#A9BEDB", maxWidth: 680 }}>
          Tiga cara mencoba konsep Living Collateral Intelligence. Yang pertama menarik data
          asli dari internet untuk alamat mana pun di Indonesia; dua lainnya adalah dashboard
          desktop dan aplikasi mobile yang portofolio dummy-nya sekarang juga bisa
          ditambahkan agunan baru dengan data real.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            marginTop: 36,
          }}
        >
          <DemoCard
            href="/live"
            icon="🛰️"
            title="Live Analysis"
            desc="Input alamat agunan apa pun di Indonesia. Skor risiko dihitung langsung dari data internet: elevasi, curah hujan, debit sungai, gempa USGS, dan OpenStreetMap."
            tag="DATA 100% REAL"
          />
          <DemoCard
            href="/simulasi"
            icon="🖥️"
            title="Simulasi Desktop"
            desc="Dashboard monitoring portofolio, Collateral Digital DNA, scenario & stress testing. Kini dilengkapi tombol 'Tambah Agunan (Data Real)' untuk menambah aset dari data live."
            tag="DUMMY + LIVE"
          />
          <DemoCard
            href="/mobile"
            icon="📱"
            title="Demo Mobile App"
            desc="Pengalaman COLARIS di dalam BRISPOT untuk Mantri/RM. Menu 'Tambah Agunan' kini menganalisis lokasi nyata memakai data publik live."
            tag="DUMMY + LIVE"
          />
        </div>

        <p style={{ fontSize: 11, color: "#7189B0", marginTop: 40, lineHeight: 1.6 }}>
          Status legal (SHM/SHGB/dll) dan estimasi nilai pasar tetap input manual karena
          data BPN dan transaksi properti Indonesia tidak tersedia sebagai API publik.
          Seluruh skor lain dihitung transparan dari sumber yang disebutkan di halaman{" "}
          <Link href="/docs" style={{ color: "#F7A468" }}>Dokumentasi</Link>.
        </p>

        <div style={{ marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#7189B0", fontWeight: "bold", marginBottom: 14 }}>
            EMBRIO 2026 BY
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <Credit name="AR Risqi Herlambang Raharjo" role="Regulatory and Spectrum Management, IT DC Infrastructure and Operation" />
            <Credit name="Bagas Kurniawan" role="Chief Information Security Officer (CISO) Group" />
            <Credit name="Jessica Olivia Anastasya" role="Retail Transaction Group" />
          </div>
        </div>
      </div>
    </main>
  );
}

function Credit({ name, role }: { name: string; role: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: "bold", color: "#fff" }}>{name}</div>
      <div style={{ fontSize: 11, color: "#8FA3C4", marginTop: 3, lineHeight: 1.4 }}>{role}</div>
    </div>
  );
}

function DemoCard({
  href,
  icon,
  title,
  desc,
  tag,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 14,
        padding: "20px 22px",
        textDecoration: "none",
        color: "#fff",
        transition: "background .15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 26 }}>{icon}</div>
        <span
          style={{
            fontSize: 9,
            fontWeight: "bold",
            letterSpacing: 1,
            color: "#F7A468",
            border: "1px solid rgba(240,164,104,.4)",
            borderRadius: 99,
            padding: "3px 8px",
          }}
        >
          {tag}
        </span>
      </div>
      <div style={{ fontSize: 16, fontWeight: "bold", marginTop: 10, color: "#fff" }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "#A9BEDB", marginTop: 6, lineHeight: 1.5 }}>{desc}</div>
      <div style={{ fontSize: 11.5, color: "#F7A468", fontWeight: "bold", marginTop: 12 }}>
        Buka demo →
      </div>
    </Link>
  );
}
