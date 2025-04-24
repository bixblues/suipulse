"use client";
import "@/styles/globals.css";
import "@/styles/mdx.css";
import { Inter } from "next/font/google";
import { RootLayout } from "@/components/layout/root-layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

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
