import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulso Cívico — Sua voz, com contexto",
  description:
    "Uma experiência demonstrativa de participação cívica, aprendizado e transparência eleitoral.",
  applicationName: "Pulso Cívico",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pulso Cívico",
  },
};

export const viewport: Viewport = {
  themeColor: "#10110f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
