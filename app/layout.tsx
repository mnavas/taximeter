import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taximeter",
  description: "Self-hosted taxi dispatch, metering, and fleet monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
