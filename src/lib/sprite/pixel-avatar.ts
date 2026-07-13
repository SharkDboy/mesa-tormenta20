import type { SpriteConfig } from "@/types/t20";

/** 0=vazio, 1=cabelo, 2=pele, 3=roupa, 4=olhos */
export type PixelLayer = 0 | 1 | 2 | 3 | 4;

const SPRITE_CURTO: PixelLayer[][] = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 2, 2, 4, 4, 2, 2, 0],
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 0, 3, 3, 3, 3, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
];

const SPRITE_LONGO: PixelLayer[][] = [
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [0, 2, 2, 4, 4, 2, 2, 0],
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 0, 3, 3, 3, 3, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
];

const SPRITE_CARECA: PixelLayer[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 2, 2, 4, 4, 2, 2, 0],
  [0, 2, 2, 2, 2, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 0, 3, 3, 3, 3, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
];

export function obterMapaSprite(config: SpriteConfig): PixelLayer[][] {
  switch (config.estiloCabelo) {
    case "longo":
      return SPRITE_LONGO;
    case "careca":
      return SPRITE_CARECA;
    default:
      return SPRITE_CURTO;
  }
}

export function corDaCamada(
  layer: PixelLayer,
  config: SpriteConfig,
): string | null {
  switch (layer) {
    case 1:
      return config.cabelo;
    case 2:
      return config.pele;
    case 3:
      return config.roupa;
    case 4:
      return "#1a1a2e";
    default:
      return null;
  }
}

export function renderizarSpriteCanvas(
  config: SpriteConfig,
  tamanhoCelula = 8,
): string | null {
  if (typeof document === "undefined") return null;

  const mapa = obterMapaSprite(config);
  const linhas = mapa.length;
  const colunas = mapa[0]?.length ?? 0;

  const canvas = document.createElement("canvas");
  canvas.width = colunas * tamanhoCelula;
  canvas.height = linhas * tamanhoCelula;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < linhas; y++) {
    for (let x = 0; x < colunas; x++) {
      const cor = corDaCamada(mapa[y][x], config);
      if (!cor) continue;
      ctx.fillStyle = cor;
      ctx.fillRect(
        x * tamanhoCelula,
        y * tamanhoCelula,
        tamanhoCelula,
        tamanhoCelula,
      );
    }
  }

  return canvas.toDataURL("image/png");
}
