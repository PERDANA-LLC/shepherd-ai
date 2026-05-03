import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shepherd AI — KJV Bible Study Assistant",
  description:
    "AI-powered King James Version Bible study tool. Get cross-references, word studies, historical context, and application questions — 24/7, free.",
  keywords: ["KJV", "Bible study", "AI Bible", "King James", "scripture", "Christian"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Shepherd AI — KJV Bible Study",
    description: "AI-powered KJV Bible study with cross-references, word studies, and printable guides.",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  appleWebApp: {
    capable: true,
    title: "Shepherd AI",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
