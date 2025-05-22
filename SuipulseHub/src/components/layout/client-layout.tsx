"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootLayout } from "./root-layout";

const queryClient = new QueryClient();

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>{children}</RootLayout>
    </QueryClientProvider>
  );
}
