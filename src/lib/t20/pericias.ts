import type { AtributoT20 } from "@/types/t20";

/** Mapa simplificado de perícias T20 → atributo base (MVP). */
export const PERICIAS_T20: Record<string, AtributoT20> = {
  acrobacia: "des",
  adestramento: "car",
  atletismo: "for",
  atuacao: "car",
  cavalgar: "des",
  conhecimento: "int",
  cura: "sab",
  diplomacia: "car",
  enganacao: "car",
  fortitude: "con",
  furtividade: "des",
  guerra: "int",
  iniciativa: "des",
  intimidacao: "car",
  intuicao: "sab",
  investigacao: "int",
  jogatina: "car",
  ladinagem: "des",
  luta: "for",
  misticismo: "int",
  nobreza: "int",
  oficio: "int",
  percepcao: "sab",
  pilotagem: "des",
  pontaria: "des",
  reflexos: "des",
  religiao: "sab",
  sobrevivencia: "sab",
  vontade: "sab",
};

export function normalizarPericia(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function obterAtributoPericia(pericia: string): AtributoT20 | null {
  return PERICIAS_T20[normalizarPericia(pericia)] ?? null;
}
