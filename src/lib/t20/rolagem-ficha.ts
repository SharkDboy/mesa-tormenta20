import type { AtributoT20, AtributosT20, PericiaT20 } from "@/types/t20";
import { obterModificador } from "@/lib/t20/atributos";
import { bonusTreinamento } from "@/lib/t20/treinamento";
import {
  normalizarPericia,
  obterAtributoPericia,
  PERICIAS_T20,
} from "@/lib/t20/pericias";
import { formatarModificador } from "@/lib/t20/dados";

export interface ModificadorPericia {
  pericia: string;
  atributo: AtributoT20;
  modAtributo: number;
  modTreino: number;
  modOutros: number;
  total: number;
  treinada: boolean;
}

export function calcularModificadorPericia(
  pericia: string,
  atributos: AtributosT20,
  nivel: number,
  pericias: Record<string, PericiaT20>,
): ModificadorPericia | null {
  const chave = normalizarPericia(pericia);
  const atributo = obterAtributoPericia(chave);
  if (!atributo) return null;

  const dadosPericia = pericias[chave] ?? { treinada: false, outros: 0 };
  const modAtributo = obterModificador(atributos, atributo);
  const modTreino = dadosPericia.treinada ? bonusTreinamento(nivel) : 0;
  const modOutros = dadosPericia.outros ?? 0;

  return {
    pericia: chave,
    atributo,
    modAtributo,
    modTreino,
    modOutros,
    total: modAtributo + modTreino + modOutros,
    treinada: dadosPericia.treinada,
  };
}

export function listarPericiasOrdenadas(): string[] {
  return Object.keys(PERICIAS_T20).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function rotuloPericia(nome: string): string {
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export function rotuloTestePericia(mod: ModificadorPericia): string {
  const partes = [
    `${rotuloPericia(mod.pericia)} (${formatarModificador(mod.total)})`,
  ];
  return partes[0];
}

export function detalheModificadoresPericia(mod: ModificadorPericia): string {
  const partes = [
    `Atributo ${formatarModificador(mod.modAtributo)}`,
    mod.modTreino > 0 ? `Treino +${mod.modTreino}` : null,
    mod.modOutros !== 0 ? `Outros ${formatarModificador(mod.modOutros)}` : null,
  ].filter(Boolean);
  return partes.join(" · ");
}
