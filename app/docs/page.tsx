import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "BRI COLARIS · Dokumentasi",
};

const NAVY = "#00305E";
const BLUE = "#0057A8";
const MUTED = "#6B7686";
const LINE = "#E1E8F1";
const ICE = "#F4F8FC";
const ORANGE = "#F0691E";
const LORANGE_BG = "#FDEEE3";

const SOURCES = [
  {
    engine: "Geocoding",
    provider: "OpenStreetMap Nominatim",
    url: "https://nominatim.openstreetmap.org",
    data: "Mengubah alamat yang diketik menjadi koordinat lintang/bujur.",
    key: "Tidak perlu",
  },
  {
    engine: "Elevation Engine",
    provider: "Open-Meteo",
    url: "https://open-meteo.com",
    data: "Ketinggian lokasi di atas permukaan laut, dipakai sebagai proxy risiko rob/genangan.",
    key: "Tidak perlu",
  },
  {
    engine: "Climate Engine",
    provider: "Open-Meteo",
    url: "https://open-meteo.com",
    data: "Curah hujan aktual 30 hari terakhir dan prakiraan 7 hari ke depan di titik koordinat.",
    key: "Tidak perlu",
  },
  {
    engine: "Flood Engine",
    provider: "Open-Meteo Flood API (GloFAS)",
    url: "https://open-meteo.com/en/docs/flood-api",
    data: "Debit sungai terkini dibandingkan puncak 30 hari terakhir, di sungai terdekat model GloFAS.",
    key: "Tidak perlu",
  },
  {
    engine: "Seismic Engine (USGS)",
    provider: "USGS Earthquake Catalog",
    url: "https://earthquake.usgs.gov/fdsnws/event/1/",
    data: "Riwayat gempa M5+ dalam radius 150 km, 10 tahun terakhir.",
    key: "Tidak perlu",
  },
  {
    engine: "Seismic Engine (BMKG)",
    provider: "BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)",
    url: "https://data.bmkg.go.id",
    data: "Feed gempa terkini resmi Indonesia, sebagai pelengkap USGS yang lebih otoritatif untuk konteks lokal.",
    key: "Tidak perlu",
  },
  {
    engine: "Air Quality Engine",
    provider: "Open-Meteo Air Quality",
    url: "https://open-meteo.com/en/docs/air-quality-api",
    data: "PM2.5, PM10, dan US AQI di titik koordinat, sebagai sinyal lingkungan tambahan untuk skor Climate.",
    key: "Tidak perlu",
  },
  {
    engine: "Media Intelligence Engine",
    provider: "GDELT Project",
    url: "https://www.gdeltproject.org",
    data: "Jumlah artikel berita dan skor tone/sentimen linguistik rata-rata untuk nama lokasi dalam 30 hari terakhir.",
    key: "Tidak perlu",
  },
  {
    engine: "Intelligence Fusion Engine",
    provider: "LLM via SumoPod (OpenAI-compatible gateway)",
    url: "https://ai.sumopod.com",
    data: "Ringkasan naratif 1-2 kalimat dari judul-judul artikel yang dikumpulkan Media Intelligence Engine, dibuat LLM yang benar-benar membaca judulnya, bukan sekadar skor angka.",
    key: "Sudah dikonfigurasi (server-side)",
  },
  {
    engine: "Economic Engine",
    provider: "World Bank Open Data",
    url: "https://data.worldbank.org",
    data: "Pertumbuhan PDB dan inflasi tahunan Indonesia (indikator nasional, bukan hyperlocal).",
    key: "Tidak perlu",
  },
  {
    engine: "Fire Hotspot Engine",
    provider: "NASA FIRMS (VIIRS)",
    url: "https://firms.modaps.eosdis.nasa.gov/api/area/",
    data: "Titik api aktif 3 hari terakhir dalam radius ~15 km, relevan terutama untuk lahan/perkebunan.",
    key: "Sudah dikonfigurasi",
  },
  {
    engine: "Agro Climatology Engine",
    provider: "NASA POWER",
    url: "https://power.larc.nasa.gov/docs/services/api/",
    data: "Rata-rata jangka panjang radiasi surya, suhu, kelembapan, dan kecepatan angin, proxy viabilitas agrikultur untuk lahan/perkebunan.",
    key: "Tidak perlu",
  },
  {
    engine: "Geo & Market Engine",
    provider: "Overpass API (OpenStreetMap)",
    url: "https://overpass-api.de",
    data: "Jarak ke sungai/kanal terdekat, jalan arteri/kolektor, sekolah, faskes, halte transit, infrastruktur listrik, dan densitas titik komersial sebagai proxy likuiditas pasar.",
    key: "Tidak perlu",
  },
];

export default function DocsPage() {
  return (
    <main style={{ background: "#fff", minHeight: "100dvh", fontFamily: "Arial, Helvetica, sans-serif", color: "#1F2A37" }}>
      <header
        style={{
          background: `linear-gradient(96deg, #031C34, ${BLUE} 130%)`,
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#fff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: "bold",
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.22)",
            borderRadius: 99,
            padding: "6px 12px",
          }}
        >
          ← Beranda
        </Link>
        <Image src="/bri-logo-white.png" alt="BRI" width={62} height={25} />
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.28)" }} />
        <div style={{ lineHeight: 1.1 }}>
          <b style={{ fontSize: 15 }}>COLARIS</b>
          <div style={{ fontSize: 9, color: "#BFD6EE", letterSpacing: 1.5 }}>DOKUMENTASI</div>
        </div>
      </header>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: ORANGE, fontWeight: "bold" }}>
          DOKUMENTASI TEKNIS
        </div>
        <h1 style={{ fontSize: 28, color: NAVY, margin: "10px 0 14px" }}>
          Dari mana data ini diambil, dan bagaimana aplikasi ini bekerja
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#3A4553", maxWidth: 720 }}>
          BRI COLARIS berbeda dari kebanyakan demo AI karena tidak memakai dummy data
          yang sudah disiapkan sebelumnya. Setiap kali analisis dijalankan, aplikasi menarik
          data nyata dari sejumlah sumber publik saat itu juga, hampir seluruhnya langsung
          dari browser pengguna tanpa database. Dua pengecualian kecil (GDELT dan LLM untuk
          Intelligence Fusion) lewat route server tipis, dijelaskan di bagian "Kenapa Ada
          Backend Route?" di bawah.
        </p>

        <Section title="Alur Kerja Aplikasi">
          <ol style={{ paddingLeft: 20, fontSize: 13.5, lineHeight: 1.9, color: "#3A4553" }}>
            <li>
              <b style={{ color: NAVY }}>Geocoding</b>, alamat yang diketik pengguna diubah menjadi
              koordinat lintang/bujur lewat OpenStreetMap Nominatim.
            </li>
            <li>
              <b style={{ color: NAVY }}>Fan-out ke 12 engine</b> secara paralel/berurutan, masing-masing
              memanggil satu API publik dengan koordinat tersebut sebagai parameter.
            </li>
            <li>
              <b style={{ color: NAVY }}>Setiap engine independen</b>, jika satu API gagal atau timeout,
              engine lain tetap berjalan. Skor yang bergantung pada data yang gagal ditarik akan
              memakai nilai netral, bukan membuat aplikasi berhenti.
            </li>
            <li>
              <b style={{ color: NAVY }}>Scoring transparan</b>, hasil mentah setiap API diubah menjadi
              skor 0 sampai 100 lewat aturan eksplisit yang bisa dibaca di kode sumber (lihat
              reason code pada setiap rekomendasi).
            </li>
            <li>
              <b style={{ color: NAVY }}>Collateral Risk Index (CRI)</b> dihitung sebagai rata-rata
              tertimbang dari seluruh dimensi skor.
            </li>
          </ol>
        </Section>

        <Section title="Sumber Data per Engine">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: ICE, textAlign: "left" }}>
                  <Th>Engine</Th>
                  <Th>Sumber</Th>
                  <Th>Data yang diambil</Th>
                  <Th>API Key</Th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.engine} style={{ borderBottom: `1px solid ${LINE}` }}>
                    <Td><b style={{ color: NAVY }}>{s.engine}</b></Td>
                    <Td>
                      <a href={s.url} target="_blank" rel="noreferrer" style={{ color: BLUE, textDecoration: "none" }}>
                        {s.provider}
                      </a>
                    </Td>
                    <Td style={{ color: "#3A4553" }}>{s.data}</Td>
                    <Td>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: "bold",
                          color: s.key === "Tidak perlu" || s.key.startsWith("Sudah") ? "#1B8A56" : ORANGE,
                        }}
                      >
                        {s.key}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Kenapa Ada Backend Route?">
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#3A4553", marginBottom: 12 }}>
            Hampir seluruh aplikasi ini jalan murni di browser, tanpa server. Ada dua
            pengecualian kecil, keduanya karena alasan teknis yang sama: CORS.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.7, color: "#3A4553" }}>
            <div>
              <b style={{ color: NAVY }}>/api/gdelt</b>: GDELT tidak konsisten mengirim header
              CORS untuk request langsung dari browser, yang muncul sebagai error generik
              "Load failed". Karena CORS murni pembatasan browser (tidak berlaku antar
              server), route ini memanggil GDELT dari server Vercel lalu meneruskan
              hasilnya lewat domain sendiri.
            </div>
            <div>
              <b style={{ color: NAVY }}>/api/summarize</b>: memanggil LLM untuk Intelligence
              Fusion Engine. API key LLM harus disimpan di server (environment variable),
              tidak pernah dikirim ke kode client, supaya tidak bisa dilihat siapa pun lewat
              "view source".
            </div>
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 12, lineHeight: 1.6 }}>
            Kalau salah satu route ini tidak tersedia (misalnya file <code>live.html</code> ini
            di-download dan dibuka langsung tanpa server di baliknya), engine terkait otomatis
            jatuh ke mekanisme cadangan atau menampilkan status "belum dikonfigurasi", tanpa
            menghentikan analisis lainnya.
          </p>
        </Section>

        <Section title="Cara Menghitung Recovery Probability">
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#3A4553", marginBottom: 16 }}>
            Recovery Probability adalah estimasi peluang bank memulihkan nilai kredit dari
            agunan seandainya terjadi gagal bayar. Modelnya mendekati pendekatan Basel untuk
            LGD (Loss Given Default): nilai agunan dikurangi serangkaian <i>haircut</i>
            (potongan), bukan dihitung langsung sebagai persentase tetap.
          </p>

          <div
            style={{
              background: ICE,
              border: `1px solid ${LINE}`,
              borderRadius: 10,
              padding: "16px 18px",
              fontFamily: "monospace",
              fontSize: 12.5,
              color: NAVY,
              marginBottom: 16,
              overflowX: "auto",
            }}
          >
            Haircut Total = (1 {"-"} Faktor Likuiditas) x 100
            <br />
            &nbsp;&nbsp;{"+"} ((100 {"-"} Skor Legal) x 0,25)
            <br />
            &nbsp;&nbsp;{"+"} (Collateral Risk Index x 0,35)
            <br />
            <br />
            Recovery Probability = clamp( 15%, 97%, 100 {"-"} Haircut Total )
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.7, color: "#3A4553" }}>
            <div>
              <b style={{ color: NAVY }}>Haircut dasar jenis agunan</b>, diturunkan dari Faktor
              Likuiditas per tipe kolateral: Rumah Tinggal (likuiditas 80%, haircut dasar 20%),
              Ruko/Komersial (78%, haircut 22%), Gudang/Industri (72%, haircut 28%), Lahan (60%,
              haircut 40%). Ini meniru tabel haircut Basel untuk kategori kolateral berbeda:
              aset yang lebih likuid dan mudah dijual dapat haircut lebih kecil.
            </div>
            <div>
              <b style={{ color: NAVY }}>Tambahan haircut dari kepastian hukum</b>, Basel
              mensyaratkan kepastian hukum (legal certainty) agar kolateral bisa diakui penuh.
              Skor Legal di bawah 100 (SHM 95, SHGB 85, HGU/Hak Pakai 72, AJB/Girik 45) menambah
              haircut secara proporsional, karena eksekusi jaminan tanpa SHM/SHGB penuh risiko
              dan biaya lebih tinggi.
            </div>
            <div>
              <b style={{ color: NAVY }}>Tambahan haircut dari risiko (CRI)</b>, Basel juga
              mensyaratkan haircut menyesuaikan volatilitas nilai aset. Collateral Risk Index
              (0 sampai 100, gabungan seluruh engine) dipakai sebagai proxy volatilitas: makin
              tinggi CRI, makin besar tambahan haircut-nya.
            </div>
            <div>
              Hasil akhir dibatasi (di-<i>clamp</i>) antara 15% dan 97%, karena dalam praktiknya
              recovery hampir tidak pernah benar-benar 0% (agunan biasanya masih punya nilai
              sisa) atau 100% (selalu ada biaya, waktu, dan ketidakpastian proses eksekusi).
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              background: LORANGE_BG,
              borderRadius: 10,
              padding: "12px 16px",
              fontSize: 12.5,
              color: "#3A4553",
              lineHeight: 1.6,
            }}
          >
            <b style={{ color: NAVY }}>Contoh:</b> Ruko (likuiditas 78%, haircut dasar 22%)
            dengan sertifikat SHM (skor Legal 95) dan CRI 34 dihitung sebagai: Haircut Total ={" "}
            22 {"+"} ((100 {"-"} 95) x 0,25) {"+"} (34 x 0,35) = 22 {"+"} 1,25 {"+"} 11,9 ={" "}
            <b>35,15%</b>. Recovery Probability = 100 {"-"} 35,15 = <b>65%</b>.
          </div>

          <p style={{ fontSize: 12, color: MUTED, marginTop: 14, lineHeight: 1.6 }}>
            Ini adalah pendekatan yang mendekati (approximate), bukan model LGD Basel yang
            literal. Basel Committee memakai tabel haircut supervisor berbasis data historis
            volatilitas harga per kelas aset, sementara di sini haircut jenis agunan
            didekati secara manual dan CRI dipakai sebagai proxy volatilitas dinamis, karena
            pada tahap idea screening ini platform belum terhubung ke data historis recovery
            rate internal BRI. Kalibrasi yang lebih presisi dan defensible secara regulasi
            dapat dilakukan begitu koneksi ke data tersebut tersedia.
          </p>
        </Section>

        <Section title="Kenapa Pakai Pendekatan Basel?">
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#3A4553", marginBottom: 14 }}>
            Recovery Probability dihitung dengan pendekatan yang mendekati Basel untuk LGD
            (Loss Given Default), karena empat alasan konkret:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, lineHeight: 1.7, color: "#3A4553" }}>
            <div>
              <b style={{ color: NAVY }}>1. Haircut adalah mekanisme asli Basel, bukan analogi.</b>{" "}
              Dalam Comprehensive Approach untuk Credit Risk Mitigation, Basel Committee
              secara literal menghitung nilai agunan yang diakui dengan memotongnya memakai
              haircut (simbol H<sub>c</sub> pada dokumen Basel), disesuaikan dengan
              volatilitas historis kelas aset. "Recovery = 100% {"-"} haircut" bukan analogi
              yang kami buat, itu memang cara bank menghitung nilai efektif agunan.
            </div>
            <div>
              <b style={{ color: NAVY }}>2. Tiap komponen haircut dipetakan ke prinsip Basel yang spesifik.</b>{" "}
              Haircut dasar per jenis agunan mencerminkan kelas aset yang punya volatilitas
              historis berbeda (properti dianggap lebih stabil dari lahan kosong). Tambahan
              haircut dari Skor Legal mencerminkan syarat <i>legal certainty</i> yang eksplisit
              disyaratkan Basel, bukan kepastian hukum yang lemah otomatis mengurangi nilai
              agunan yang diakui. Tambahan haircut dari CRI menggantikan kalibrasi volatilitas
              harga historis Basel dengan sinyal risiko real-time (iklim, gempa, ekonomi,
              pasar) sebagai proxy, karena pada tahap idea screening ini platform belum
              terhubung ke data historis recovery rate internal BRI.
            </div>
            <div>
              <b style={{ color: NAVY }}>3. Konsisten dengan proposal COLARIS itu sendiri.</b>{" "}
              Bagian kepatuhan proposal menyebut "prinsip Basel Committee mengenai manajemen
              risiko kredit", dan perhitungan Recovery Probability dirancang agar benar-benar
              merefleksikan prinsip tersebut, bukan sekadar disebut di narasi kepatuhan.
            </div>
            <div>
              <b style={{ color: NAVY }}>4. Lebih mudah diaudit dan dipertahankan.</b>{" "}
              Setiap angka pada formula punya rujukan konseptual yang bisa dijelaskan ke
              pihak manajemen risiko atau regulator, karena mengikuti struktur haircut yang
              sudah dikenal dalam praktik perbankan.
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              background: LORANGE_BG,
              borderRadius: 10,
              padding: "12px 16px",
              fontSize: 12.5,
              color: "#3A4553",
              lineHeight: 1.6,
            }}
          >
            <b style={{ color: NAVY }}>Yang tetap jujur perlu diakui:</b> ini adaptasi
            struktural dari logika Basel, bukan implementasi tabel haircut supervisor Basel
            yang literal. Basel mengkalibrasi haircut dari data volatilitas historis riil per
            kelas aset dan periode holding tertentu; pada tahap idea screening ini, platform
            belum terhubung ke data tersebut, sehingga haircut dasar per jenis agunan
            diperkirakan manual dan CRI dipakai sebagai pengganti volatilitas dinamis. Setelah
            terhubung ke data historis recovery rate internal BRI, model ini dapat dikalibrasi
            ulang agar lebih presisi dan defensible secara regulasi.
          </div>
        </Section>

        <Section title="Keterbatasan yang Jujur Kami Akui">
          <ul style={{ paddingLeft: 20, fontSize: 13.5, lineHeight: 1.9, color: "#3A4553" }}>
            <li>
              <b style={{ color: NAVY }}>Status legal (SHM/SHGB/dll)</b> tetap input manual karena data
              pertanahan BPN tidak tersedia sebagai API publik yang bisa diakses browser.
            </li>
            <li>
              <b style={{ color: NAVY }}>Nilai pasar dan plafon kredit</b> juga input manual, karena
              tidak ada API transaksi properti Indonesia yang publik.
            </li>
            <li>
              <b style={{ color: NAVY }}>Economic Intelligence bersifat nasional</b>, bukan hyperlocal:
              GDP growth dan inflasi dari World Bank sama untuk seluruh Indonesia, bukan spesifik
              per kecamatan.
            </li>
            <li>
              <b style={{ color: NAVY }}>Fire Hotspot Engine</b> sudah aktif memakai MAP_KEY gratis
              dari{" "}
              <a href="https://firms.modaps.eosdis.nasa.gov/api/area/" target="_blank" rel="noreferrer" style={{ color: BLUE }}>
                NASA FIRMS
              </a>
              . Cakupan tetap sebatas radius ~15 km dan 3 hari terakhir, paling relevan untuk
              agunan berupa lahan/perkebunan.
            </li>
            <li>
              <b style={{ color: NAVY }}>Intelligence Fusion Engine</b> membaca dan meringkas
              maksimal 8 judul artikel dari Media Intelligence Engine (GDELT) lewat LLM,
              dijalankan di server (bukan browser) supaya API key tidak pernah terekspos.
              Ringkasannya dibatasi pada apa yang tersirat di judul saja, bukan pembacaan
              artikel penuh, karena GDELT hanya menyediakan judul dan metadata, bukan isi
              artikel lengkap.
            </li>
            <li>
              <b style={{ color: NAVY }}>Overpass API</b> (OpenStreetMap) adalah layanan publik gratis
              yang kadang overload. Aplikasi mencoba 3 server mirror berbeda secara berurutan
              sebelum menyerah ke skor netral.
            </li>
            <li>
              Seluruh skor adalah <b style={{ color: NAVY }}>decision support</b>, bukan appraisal resmi.
              Keputusan kredit tetap memerlukan verifikasi manusia (human-in-the-loop).
            </li>
          </ul>
        </Section>

        <Section title="Tiga Cara Mencoba">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <MiniCard href="/live" title="Live Analysis" desc="Tool analisis mandiri, satu alamat satu hasil lengkap." />
            <MiniCard href="/simulasi" title="Simulasi Desktop" desc="Dashboard portofolio dummy + tombol tambah agunan data real." />
            <MiniCard href="/mobile" title="Mobile Demo" desc="Pengalaman BRISPOT mobile + menu tambah agunan data real." />
          </div>
        </Section>

        <p style={{ fontSize: 11, color: "#9AA5B4", marginTop: 40, lineHeight: 1.6 }}>
          Proposal EMBRIO 2026, BRI COLARIS (Collateral Risk Intelligence System). Seluruh
          proyeksi dampak pada dek presentasi bersifat target manajemen dan akan diuji pada
          tahap Proof of Concept.
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 13, color: "#6B7686", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontWeight: "bold" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "9px 10px", fontSize: 10.5, color: MUTED, fontWeight: "bold", letterSpacing: 0.3 }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "9px 10px", verticalAlign: "top", ...style }}>{children}</td>;
}

function MiniCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        padding: "14px 16px",
        textDecoration: "none",
        background: ICE,
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: "bold", color: NAVY }}>{title}</div>
      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
    </Link>
  );
}
