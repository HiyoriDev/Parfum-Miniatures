import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-8xl font-semibold text-accent italic">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Page introuvable</h1>
      <p className="mt-3 text-texte-doux">
        Cette miniature ou cette page n&apos;existe pas (ou plus).
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Retour à la collection
      </Link>
    </div>
  );
}
