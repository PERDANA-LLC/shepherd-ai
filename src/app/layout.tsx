import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shepherd AI — KJV Bible Study Assistant",
  description:
    "AI-powered King James Version Bible study tool. Get cross-references, word studies, historical context, and application questions — 24/7, free.",
  keywords: ["KJV", "Bible study", "AI Bible", "King James", "scripture", "Christian"],
  openGraph: {
    title: "Shepherd AI — KJV Bible Study",
    description: "AI-powered KJV Bible study with cross-references, word studies, and printable guides.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
