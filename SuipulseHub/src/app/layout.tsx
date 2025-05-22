"use client";
import "@/styles/globals.css";
import "@/styles/mdx.css";
import { Inter } from "next/font/google";
import { RootLayout } from "@/components/layout/root-layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

const metadata = {
  title: "SuiPulse - Real-time Data Streams on Sui",
  description:
    "Build, manage, and scale your data streams with ease. SuiPulse provides a powerful SDK and CLI for seamless data stream management on the Sui blockchain.",
  keywords: [
    "Sui",
    "blockchain",
    "data streams",
    "real-time",
    "SDK",
    "CLI",
    "Web3",
    "DeFi",
    "IoT",
  ],
  authors: [{ name: "SuiPulse Team" }],
  creator: "SuiPulse",
  publisher: "SuiPulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://suipulse.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://suipulse.com",
    title: "SuiPulse - Real-time Data Streams on Sui",
    description:
      "Build, manage, and scale your data streams with ease. SuiPulse provides a powerful SDK and CLI for seamless data stream management on the Sui blockchain.",
    siteName: "SuiPulse",
    images: [
      {
        url: "/favicon.svg",
        width: 630,
        height: 630,
        alt: "SuiPulse - Real-time Data Streams on Sui",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const queryClient = new QueryClient();

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <RootLayout>{children}</RootLayout>
        </QueryClientProvider>
      </body>
    </html>
  );
}
