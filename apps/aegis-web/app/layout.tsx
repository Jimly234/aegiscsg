import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis CSG - Civilian Safety Grid",
  description:
    "Decentralized, intelligence-driven security ecosystem for civilian safety",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
