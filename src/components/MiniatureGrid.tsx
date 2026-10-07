import type { PerfumeSummary } from "@/lib/perfume";

import MiniatureCard from "./MiniatureCard";

export default function MiniatureGrid({
  perfumes,
  onOpen,
}: {
  perfumes: PerfumeSummary[];
  onOpen?: (index: number) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {perfumes.map((perfume, index) => (
        <li key={perfume.id}>
          <MiniatureCard
            perfume={perfume}
            priority={index < 6}
            onOpen={onOpen && (() => onOpen(index))}
          />
        </li>
      ))}
    </ul>
  );
}
