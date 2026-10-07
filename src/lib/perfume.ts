export type Perfume = {
  id: number;
  parfum: string;
  parfumeur: string;
  boite: string;
  type: string;
  contenance: string;
  image_file: string;
  description: string | null;
};

/** Colonnes affichées dans les grilles (la description n'y sert pas). */
export type PerfumeSummary = Omit<Perfume, "description">;

export const TYPE_LABELS: Record<string, string> = {
  ADP: "Absolu de Parfum",
  APP: "Applicateur",
  ASB: "After Shave Balm",
  ASL: "After Shave Lotion",
  B: "Bain",
  BAR: "Baume Après Rasage",
  BP: "Boîte à poudre",
  BR: "Brillantine",
  C: "Cologne",
  CA: "Jeu de cartes",
  CC: "Cologne Concentrate",
  CP: "Cologne Parfumée",
  D: "Dentifrice",
  E: "Eau",
  EDC: "Eau de Cologne",
  EDCF: "",
  EDF: "Eau de Fraîcheur",
  EDP: "Eau de Parfum",
  EDPC: "Eau de Parfum Concentrée",
  EDPE: "Eau de Parfum Extrême",
  EDPF: "Eau de Parfum Florale",
  EDPI: "Eau de Parfum Intense",
  EDPL: "Eau de Parfum Légère",
  EDPP: "Eau de Parfum Poudrée",
  EDPS: "Eau de Parfum Spray",
  EDS: "Eau de Sport",
  EDT: "Eau de Toilette",
  EDTC: "Eau de Toilette Concentrée",
  EDTF: "Eau de Toilette Fraîche",
  EDTI: "Eau de Toilette Intense",
  EDTL: "Eau de Toilette Légère",
  EDTS: "Eau de Toilette Spray",
  EDTV: "Eau de Toilette Vitalisante",
  EE: "Eau d'Extrait",
  EF: "Eau Florale",
  EP: "Eau Parfumée",
  ESP: "Esprit de Parfum",
  EXP: "Extrait de Parfum",
  EXT: "Extrait",
  F: "Friction",
  FDP: "Fleur de Parfum",
  GD: "Gel Douche",
  H: "Huile",
  L: "Lotion",
  LAIT: "Lait",
  LAR: "Lotion Après Rasage",
  P: "Parfum",
  PC: "Parfum Crème",
  PDT: "Parfum de Toilette",
  PSL: "Pre Shave Lotion",
  S: "Savon",
  SEDT: "",
  SHP: "Shampooing",
  T: "Talc",
  V: "Voile",
  XDP: "Extrême de Parfum",
};

export const TYPE_CODES = Object.keys(TYPE_LABELS);

/** Libellé complet d'un code de type ; à défaut, le code lui-même. */
export function typeLabel(code: string | null | undefined) {
  if (!code) return "Type inconnu";
  return TYPE_LABELS[code] || code;
}

export const BOITE_VALUES = ["Oui", "Non"] as const;

/** Filtre alphabétique : "#" regroupe les noms qui commencent par un chiffre. */
export const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"] as const;
export type Letter = (typeof LETTERS)[number];

export function parseLetter(value: string | string[] | undefined): Letter | null {
  const letter = typeof value === "string" ? value.toUpperCase() : "";
  return (LETTERS as readonly string[]).includes(letter) ? (letter as Letter) : null;
}

/** Lettre de rangement d'un nom : Ô, É… vont avec O, E…, les chiffres sous « # ». */
export function initialLetter(name: string): Letter | null {
  const char = name.normalize("NFD").charAt(0).toUpperCase().replace("Œ", "O").replace("Æ", "A");
  return /[0-9]/.test(char) ? "#" : parseLetter(char);
}

/** Texte de recherche lu dans l'URL, nettoyé et borné. */
export function parseText(value: string | string[] | undefined) {
  return (typeof value === "string" ? value : "").trim().slice(0, 100);
}

export function parsePage(value: string | string[] | undefined) {
  const page = Number(typeof value === "string" ? value : 1);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function formatCount(value: number) {
  return value.toLocaleString("fr-FR");
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${formatCount(count)} ${count > 1 ? pluralForm : singular}`;
}
