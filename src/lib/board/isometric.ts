/** Conversões para grid isométrico 2:1 (Passo 5). */

export interface PontoGrid {
  gridX: number;
  gridY: number;
}

export interface PontoTela {
  x: number;
  y: number;
}

export function gridParaTela(
  gridX: number,
  gridY: number,
  tileW: number,
  tileH: number,
  offsetX = 0,
  offsetY = 0,
): PontoTela {
  const x = (gridX - gridY) * (tileW / 2) + offsetX;
  const y = (gridX + gridY) * (tileH / 2) + offsetY;
  return { x, y };
}

export function telaParaGrid(
  x: number,
  y: number,
  tileW: number,
  tileH: number,
  offsetX = 0,
  offsetY = 0,
): PontoGrid {
  const rx = x - offsetX;
  const ry = y - offsetY;
  const gridX = Math.round((rx / (tileW / 2) + ry / (tileH / 2)) / 2);
  const gridY = Math.round((ry / (tileH / 2) - rx / (tileW / 2)) / 2);
  return { gridX, gridY };
}
