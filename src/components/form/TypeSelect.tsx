"use client";

import { TYPE_CODES, typeLabel } from "@/lib/perfume";

type Props = Omit<React.ComponentProps<"select">, "children"> & {
  value: string;
  /** Codes seuls, pour les colonnes étroites ; le libellé complet s'affiche au survol. */
  compact?: boolean;
};

/** Liste des types ; une valeur hors liste déjà en base reste proposée pour ne pas être perdue. */
export default function TypeSelect({ value, compact, className = "field", ...props }: Props) {
  const codes = value && !TYPE_CODES.includes(value) ? [value, ...TYPE_CODES] : TYPE_CODES;

  return (
    <select
      name="type"
      value={value}
      title={compact && value ? typeLabel(value) : undefined}
      className={className}
      {...props}
    >
      <option value="">—</option>
      {codes.map((code) => (
        <option key={code} value={code}>
          {compact || typeLabel(code) === code ? code : `${code} — ${typeLabel(code)}`}
        </option>
      ))}
    </select>
  );
}
