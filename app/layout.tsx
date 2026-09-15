import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleFrame — Structured comparison culture",
  description: "Build the comparison once. Keep the evidence, analysis, and creative work attached.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
