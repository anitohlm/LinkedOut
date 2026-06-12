import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkedOut — Your Multiverse Awaits",
  description:
    "A narrative RPG where your resume becomes the origin story of six alternate versions of yourself across the multiverse.",
  openGraph: {
    title: "LinkedOut",
    description: "Meet the people you could have become.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Share+Tech+Mono&family=Exo+2:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {children}
      </body>
    </html>
  );
}
