import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRI COLARIS · Real-Time Collateral Risk Analysis",
  description:
    "Analisis risiko agunan real-time menggunakan data publik: elevasi, curah hujan, debit sungai, gempa USGS, dan OpenStreetMap. EMBRIO 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
