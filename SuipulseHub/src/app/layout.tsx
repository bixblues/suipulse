import "@/styles/globals.css";
import "@/styles/mdx.css";
import { Inter } from "next/font/google";
import { ClientLayout } from "@/components/layout/client-layout";
import { metadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
