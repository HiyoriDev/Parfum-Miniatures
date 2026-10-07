"use client";

import { useState } from "react";

import MiniatureGrid from "@/components/MiniatureGrid";
import type { Perfume } from "@/lib/perfume";

import Lightbox from "./Lightbox";

export default function SearchResults({ perfumes }: { perfumes: Perfume[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <MiniatureGrid perfumes={perfumes} onOpen={setOpenIndex} />
      {openIndex !== null && (
        <Lightbox
          perfumes={perfumes}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
