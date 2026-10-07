"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useIsAdmin } from "./AdminProvider";
import { visibleNavItems } from "./navigation";

/** Barre d'onglets fixée en bas de l'écran sur mobile (< md), comme une application. */
export default function MobileTabBar() {
  const pathname = usePathname();
  const items = visibleNavItems(useIsAdmin());

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-texte/10 bg-carte/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs leading-none font-medium transition-colors focus-visible:-outline-offset-2 ${
                  active ? "text-texte" : "text-texte-doux"
                }`}
              >
                <span
                  className={`grid h-8 w-12 place-items-center rounded-2xl transition-colors motion-reduce:transition-none ${
                    active ? "bg-accent/20 text-accent-fonce ring-1 ring-accent/35" : ""
                  }`}
                >
                  <Icon aria-hidden size={20} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className="max-w-full truncate px-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
