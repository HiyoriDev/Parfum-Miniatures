export default function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="panel mx-auto max-w-lg px-6 py-12 text-center">
      <p className="font-display text-2xl font-semibold">{title}</p>
      {children && <div className="mt-3 text-sm text-texte-doux">{children}</div>}
    </div>
  );
}
