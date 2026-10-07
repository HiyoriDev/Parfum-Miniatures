/** Affiché pendant le chargement d'une page : une grille fantôme de miniatures. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className="mx-auto max-w-screen-2xl px-4 pt-8 pb-16 md:px-8 md:pt-14"
    >
      <div className="mx-auto mb-10 h-14 max-w-md animate-pulse rounded-2xl bg-texte/10" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => (
          <li key={index} className="rounded-2xl bg-carte/60 p-2">
            <div className="aspect-4/3 animate-pulse rounded-xl bg-texte/10" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-texte/10" />
            <div className="mt-2 mb-1 h-3 w-1/2 animate-pulse rounded bg-texte/10" />
          </li>
        ))}
      </ul>
    </div>
  );
}
