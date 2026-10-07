"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useIsAdmin } from "./AdminProvider";
import { visibleNavItems } from "./navigation";

export default function Header() {
  const pathname = usePathname();
  const items = visibleNavItems(useIsAdmin());

  return (
    <header className="sticky top-0 z-40 border-b border-texte/5 bg-surface/85 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-6 px-4 md:h-16 md:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-wide text-texte transition-colors hover:text-accent-fonce md:text-[28px]"
        >
          Notre Collection
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1 lg:gap-2">
            {items.map(({ href, label, isActive }) => {
              const active = isActive(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-xl px-4 py-2 text-base font-medium transition-colors after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors ${
                      active
                        ? "text-texte after:bg-accent"
                        : "text-texte/75 after:bg-transparent hover:text-texte hover:after:bg-texte/15"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
