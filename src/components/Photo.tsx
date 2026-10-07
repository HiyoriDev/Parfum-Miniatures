type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Photo de miniature (4:3, servie telle quelle par Supabase Storage).
 * Volontairement une balise <img> : les photos font déjà ~30 Ko, et passer
 * 8 000 images par l'optimiseur de Vercel épuiserait vite son quota.
 */
export default function Photo({ src, alt, className = "", priority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={640}
      height={480}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`aspect-4/3 w-full bg-white object-cover ${className}`}
    />
  );
}
