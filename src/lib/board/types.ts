import type { SpriteConfig, TipoFicha } from "@/types/t20";

export interface ConfigTabuleiro {
  gridColunas: number;
  gridLinhas: number;
  tileLargura: number;
  tileAltura: number;
}

export interface FichaNoTabuleiro {
  id: string;
  nome: string;
  tipo: TipoFicha;
  donoId: string | null;
  pvAtual: number;
  pvMax: number;
  pmAtual: number;
  pmMax: number;
  spriteConfig: SpriteConfig;
}

export interface TokenNoTabuleiro {
  posicaoId: string;
  fichaId: string;
  gridX: number;
  gridY: number;
  visivel: boolean;
  ficha: FichaNoTabuleiro;
}

export interface OffsetTabuleiro {
  offsetX: number;
  offsetY: number;
}
