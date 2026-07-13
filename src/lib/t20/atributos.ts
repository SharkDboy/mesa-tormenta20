import type { AtributoT20, AtributosT20 } from "@/types/t20";

export const ATRIBUTOS_T20: { key: AtributoT20; label: string; col: keyof AtributosT20 }[] = [
  { key: "for", label: "Força", col: "for_mod" },
  { key: "des", label: "Destreza", col: "des_mod" },
  { key: "con", label: "Constituição", col: "con_mod" },
  { key: "int", label: "Inteligência", col: "int_mod" },
  { key: "sab", label: "Sabedoria", col: "sab_mod" },
  { key: "car", label: "Carisma", col: "car_mod" },
];

export function formatarModificador(valor: number): string {
  return valor >= 0 ? `+${valor}` : `${valor}`;
}

export function obterModificador(atributos: AtributosT20, atributo: AtributoT20): number {
  const mapa: Record<AtributoT20, keyof AtributosT20> = {
    for: "for_mod",
    des: "des_mod",
    con: "con_mod",
    int: "int_mod",
    sab: "sab_mod",
    car: "car_mod",
  };
  return atributos[mapa[atributo]];
}
