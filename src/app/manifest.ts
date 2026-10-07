import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/site";

/** Permet d'ajouter le site à l'écran d'accueil et de l'ouvrir comme une application. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Miniatures",
    description: "Collection de miniatures de parfum avec leurs photos.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#ede7dc",
    theme_color: "#ede7dc",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
