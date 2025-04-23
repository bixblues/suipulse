"use client";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { RootLayout } from "@/components/layout/root-layout";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "@/config/network";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig}>
            <WalletProvider>
              <RootLayout>{children}</RootLayout>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
