import type { Metadata } from "next";
import "./globals.css";
import DynamicMetadata from "@/components/DynamicMetadata";

export const metadata: Metadata = {
  title: "",
  description: "Watch Movies/Series for free with Best streaming powered by Fast CDN. Smooth 4K quality.",
  keywords: ["streaming", "p2p", "webtorrent", "movies", "free", "4k", "netflix"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <DynamicMetadata />
      </head>
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
