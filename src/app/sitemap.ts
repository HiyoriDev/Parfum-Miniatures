import type { MetadataRoute } from "next";

import { listParfumeurs, selectAll } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

// Régénéré au plus une fois par jour.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, SITE_URL).href;
  const [rows, parfumeurs] = await Promise.all([selectAll<{ id: number }>("id"), listParfumeurs()]);

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/parfumeurs"), changeFrequency: "weekly", priority: 0.8 },
    ...parfumeurs.map(({ name }) => ({
      url: url(`/parfumeurs/${encodeURIComponent(name)}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...rows.map(({ id }) => ({
      url: url(`/parfum/${id}`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
