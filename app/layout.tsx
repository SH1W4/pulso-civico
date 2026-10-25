import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulso Cívico — Fontes abertas, leitura crítica",
  description:
    "Um hub de acesso a fontes públicas, ferramentas de verificação e leitura crítica da informação cívica. Consulte as fontes originais e os limites de cada recurso.",
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
