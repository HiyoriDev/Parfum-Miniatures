import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  pathname: string;
  /** Paramètres d'URL à conserver d'une page à l'autre (filtres, recherche…). */
  params?: Record<string, string | undefined>;
};

const item =
  "grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-medium tabular-nums transition-colors";

export function pageHref(pathname: string, params: Props["params"], page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function Pagination({ page, totalPages, pathname, params }: Props) {
  if (totalPages <= 1) return null;

  const href = (target: number) => pageHref(pathname, params, target);
  // Pages voisines : ±2 sur grand écran, ±1 sur petit écran.
  const near = (target: number, distance: number) =>
    target === 1 || target === totalPages || Math.abs(target - page) <= distance;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((target) =>
    near(target, 2),
  );
  const mobilePages = pages.filter((target) => near(target, 1));

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          aria-label="Page précédente"
          className={`${item} bg-carte/80 hover:bg-surface`}
        >
          <ChevronLeft aria-hidden size={18} />
        </Link>
      ) : (
        <span aria-hidden className={`${item} bg-carte/40 text-texte/30`}>
          <ChevronLeft size={18} />
        </span>
      )}

      {pages.map((target, index) => {
        const onMobile = mobilePages.includes(target);
        const mobileIndex = mobilePages.indexOf(target);
        const gap = index > 0 && target - pages[index - 1] > 1;
        const mobileGap = mobileIndex > 0 && target - mobilePages[mobileIndex - 1] > 1;
        const gapClass = gap && mobileGap ? "" : gap ? "max-sm:hidden" : "sm:hidden";
        return (
          <span key={target} className="contents">
            {(gap || mobileGap) && (
              <span aria-hidden className={`px-1 text-texte/50 ${gapClass}`}>
                …
              </span>
            )}
            {target === page ? (
              <span aria-current="page" className={`${item} bg-texte text-fond`}>
                {target}
              </span>
            ) : (
              <Link
                href={href(target)}
                className={`${item} bg-carte/80 hover:bg-surface ${onMobile ? "" : "max-sm:hidden"}`}
              >
                {target}
              </Link>
            )}
          </span>
        );
      })}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          aria-label="Page suivante"
          className={`${item} bg-carte/80 hover:bg-surface`}
        >
          <ChevronRight aria-hidden size={18} />
        </Link>
      ) : (
        <span aria-hidden className={`${item} bg-carte/40 text-texte/30`}>
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}
