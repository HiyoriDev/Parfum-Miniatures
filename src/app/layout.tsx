import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { AdminProvider } from "@/components/AdminProvider";
import { NavigationTracker } from "@/components/BackButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileTabBar from "@/components/MobileTabBar";
import { isAdmin } from "@/lib/session";
import { SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description:
    "Collection de miniatures de parfum avec leurs photos, classées par parfumeur, avec ou sans leur boîte.",
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: "Miniatures", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#ede7dc",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const admin = await isAdmin();

  return (
    <html lang="fr" className={`${geist.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh flex-col pb-(--tab-bar) md:pb-0">
        <a
          href="#contenu"
          className="sr-only z-50 rounded-xl bg-texte px-4 py-2 text-fond focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>

        <AdminProvider isAdmin={admin}>
          <Header />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </AdminProvider>
        <NavigationTracker />

        <Toaster
          position="top-center"
          containerStyle={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}
          toastOptions={{
            style: {
              background: "var(--carte)",
              color: "var(--texte)",
              border: "1px solid rgb(53 39 31 / 0.08)",
              borderRadius: "16px",
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
        {/* Mesure d'audience du Central Admin (sans cookies) */}
        <Script src="https://panel.chez-chlopie.fr/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
