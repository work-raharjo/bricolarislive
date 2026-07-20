export const metadata = {
  title: "BRI COLARIS Live · Simulasi Desktop",
};

export default function SimulasiPage() {
  return (
    <iframe
      src="/demos/simulasi.html"
      title="BRI COLARIS Simulasi Desktop"
      style={{ border: "none", width: "100vw", height: "100dvh", display: "block" }}
    />
  );
}
