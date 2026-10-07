import { LayoutGrid, Search, Settings2, SprayCan, type LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  isActive: (pathname: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Collection", icon: LayoutGrid, isActive: (path) => path === "/" },
  {
    href: "/parfumeurs",
    label: "Parfumeurs",
    icon: SprayCan,
    isActive: (path) => path.startsWith("/parfumeurs"),
  },
  {
    href: "/recherche",
    label: "Recherche",
    icon: Search,
    isActive: (path) => path.startsWith("/recherche"),
  },
  {
    href: "/gestion",
    label: "Gestion",
    icon: Settings2,
    adminOnly: true,
    isActive: (path) => path.startsWith("/gestion"),
  },
];

export function visibleNavItems(isAdmin: boolean) {
  return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}
