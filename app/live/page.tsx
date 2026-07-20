export const metadata = {
  title: "BRI COLARIS · Analisis Data Real",
};

export default function LivePage() {
  return (
    <iframe
      src="/demos/live.html"
      title="BRI COLARIS Analysis"
      style={{ border: "none", width: "100vw", height: "100dvh", display: "block" }}
    />
  );
}
