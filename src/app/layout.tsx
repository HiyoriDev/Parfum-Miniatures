import { Analytics } from "@vercel/analytics/next";

import { SpeedInsights } from "@vercel/speed-insights/next";

import type { Metadata } from "next";

import { Toaster } from "react-hot-toast";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { AdminProvider } from "../context/AdminContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parfum Miniatures",
  description: "Collection de miniatures de parfum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--fond)] text-[var(--texte)]">
        <AdminProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--texte)",
                border: "1px solid rgba(0,0,0,0.05)",
                borderRadius: "16px",
              },
            }}
          />

          {children}
          <Analytics />
          <SpeedInsights />
        </AdminProvider>
      </body>
    </html>
  );
}
