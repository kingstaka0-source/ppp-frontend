import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tunereach.app"),

  title: "TuneReach | AI-Powered Playlist Promotion",

  description:
    "Find playlist opportunities, generate personalized AI pitches, automate curator outreach and grow your Spotify career with AI.",

  keywords: [
    "Spotify",
    "Playlist Promotion",
    "AI",
    "Music Marketing",
    "Curators",
    "Playlist Pitching",
    "TuneReach",
  ],

  authors: [{ name: "TuneReach" }],

  openGraph: {
    title: "TuneReach | AI-Powered Playlist Promotion",
    description:
      "Grow your Spotify career using AI-powered playlist pitching.",
    url: "https://tunereach.app",
    siteName: "TuneReach",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TuneReach AI Playlist Promotion",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "TuneReach | AI-Powered Playlist Promotion",
    description:
      "Grow your Spotify career using AI-powered playlist pitching.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>

      <GoogleAnalytics gaId="G-BNEQ9LMQ3N" />
    </html>
  );
}
