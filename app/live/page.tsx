export const metadata = {
  title: "BRI COLARIS Live · Analisis Data Real",
};

export default function LivePage() {
  return (
    <iframe
      src="/demos/live.html"
      title="BRI COLARIS Live Analysis"
      style={{ border: "none", width: "100vw", height: "100dvh", display: "block" }}
    />
  );
}
