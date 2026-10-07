"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Un souci est survenu</h1>
      <p className="mt-3 text-texte-doux">
        La collection n&apos;a pas pu être chargée. Réessaie dans un instant.
      </p>
      <button type="button" onClick={retry} className="btn btn-primary mt-8">
        Réessayer
      </button>
    </div>
  );
}
