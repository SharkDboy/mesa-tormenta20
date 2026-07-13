import type { SpriteConfig } from "@/types/t20";
import { SPRITE_CONFIG_PADRAO } from "@/types/t20";
import type { ConfigTabuleiro, OffsetTabuleiro } from "./types";
import { gridParaTela } from "./isometric";

export function calcularOffsetTabuleiro(
  config: ConfigTabuleiro,
  larguraCanvas: number,
  alturaCanvas: number,
): OffsetTabuleiro {
  const { gridColunas, gridLinhas, tileLargura, tileAltura } = config;
  const cantos = [
    gridParaTela(0, 0, tileLargura, tileAltura),
    gridParaTela(gridColunas - 1, 0, tileLargura, tileAltura),
    gridParaTela(0, gridLinhas - 1, tileLargura, tileAltura),
    gridParaTela(gridColunas - 1, gridLinhas - 1, tileLargura, tileAltura),
  ];

  const hw = tileLargura / 2;
  const hh = tileAltura / 2;

  const minX = Math.min(...cantos.map((c) => c.x)) - hw;
  const maxX = Math.max(...cantos.map((c) => c.x)) + hw;
  const minY = Math.min(...cantos.map((c) => c.y)) - hh;
  const maxY = Math.max(...cantos.map((c) => c.y)) + hh + 24;

  const gridW = maxX - minX;
  const gridH = maxY - minY;

  return {
    offsetX: (larguraCanvas - gridW) / 2 - minX,
    offsetY: (alturaCanvas - gridH) / 2 - minY,
  };
}

export function clampGrid(
  gridX: number,
  gridY: number,
  config: ConfigTabuleiro,
): { gridX: number; gridY: number } {
  return {
    gridX: Math.max(0, Math.min(config.gridColunas - 1, gridX)),
    gridY: Math.max(0, Math.min(config.gridLinhas - 1, gridY)),
  };
}

export function escurecerCor(hex: string, fator = 0.75): string {
  const limpo = hex.replace("#", "");
  if (limpo.length !== 6) return hex;
  const r = Math.floor(parseInt(limpo.slice(0, 2), 16) * fator);
  const g = Math.floor(parseInt(limpo.slice(2, 4), 16) * fator);
  const b = Math.floor(parseInt(limpo.slice(4, 6), 16) * fator);
  return `rgb(${r},${g},${b})`;
}

export function clarearCor(hex: string, fator = 1.15): string {
  const limpo = hex.replace("#", "");
  if (limpo.length !== 6) return hex;
  const r = Math.min(255, Math.floor(parseInt(limpo.slice(0, 2), 16) * fator));
  const g = Math.min(255, Math.floor(parseInt(limpo.slice(2, 4), 16) * fator));
  const b = Math.min(255, Math.floor(parseInt(limpo.slice(4, 6), 16) * fator));
  return `rgb(${r},${g},${b})`;
}

export function parseSpriteConfig(raw: unknown): SpriteConfig {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    return {
      pele: typeof obj.pele === "string" ? obj.pele : SPRITE_CONFIG_PADRAO.pele,
      cabelo:
        typeof obj.cabelo === "string" ? obj.cabelo : SPRITE_CONFIG_PADRAO.cabelo,
      roupa:
        typeof obj.roupa === "string" ? obj.roupa : SPRITE_CONFIG_PADRAO.roupa,
      estiloCabelo:
        obj.estiloCabelo === "longo" || obj.estiloCabelo === "careca"
          ? obj.estiloCabelo
          : "curto",
    };
  }
  return { ...SPRITE_CONFIG_PADRAO };
}

/** Ordena tokens para desenho: maior (x+y) na frente. */
export function ordenarTokensPorProfundidade<T extends { gridX: number; gridY: number }>(
  tokens: T[],
): T[] {
  return [...tokens].sort((a, b) => a.gridX + a.gridY - (b.gridX + b.gridY));
}
