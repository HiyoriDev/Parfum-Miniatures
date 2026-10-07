"use client";

import { BOITE_VALUES } from "@/lib/perfume";

type Props = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
};

/** Choix Oui / Non de la boîte, envoyé avec le formulaire via un champ caché. */
export default function BoiteToggle({ value, onChange, name = "boite", label = "Boîte" }: Props) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-texte/5 p-1">
      <input type="hidden" name={name} value={value} />
      {BOITE_VALUES.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={`h-9 min-w-14 rounded-lg px-3 text-sm font-medium transition-colors ${
            value === option ? "bg-texte text-fond shadow-sm" : "text-texte/70 hover:bg-texte/5"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
