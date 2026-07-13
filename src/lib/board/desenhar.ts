import type { ConfigTabuleiro, FichaNoTabuleiro, TokenNoTabuleiro } from "./types";
import type { SpriteConfig } from "@/types/t20";
import { gridParaTela } from "./isometric";
import { clarearCor, escurecerCor, parseSpriteConfig } from "./utils";

const COR_GRID = "#1f3460";
const COR_GRID_BORDA = "#3d5a80";
const COR_GRID_HOVER = "#2a4a6a";
const COR_HP_FUNDO = "#1a1a2e";
const COR_HP = "#e74c3c";
const COR_MP = "#3498db";

export function desenharGrid(
  ctx: CanvasRenderingContext2D,
  config: ConfigTabuleiro,
  offsetX: number,
  offsetY: number,
  hoverCelula: { gridX: number; gridY: number } | null,
) {
  const { gridColunas, gridLinhas, tileLargura, tileAltura } = config;
  const hw = tileLargura / 2;
  const hh = tileAltura / 2;

  for (let gy = 0; gy < gridLinhas; gy++) {
    for (let gx = 0; gx < gridColunas; gx++) {
      const { x, y } = gridParaTela(gx, gy, tileLargura, tileAltura, offsetX, offsetY);
      const hover = hoverCelula?.gridX === gx && hoverCelula?.gridY === gy;

      ctx.beginPath();
      ctx.moveTo(x, y - hh);
      ctx.lineTo(x + hw, y);
      ctx.lineTo(x, y + hh);
      ctx.lineTo(x - hw, y);
      ctx.closePath();
      ctx.fillStyle = hover ? COR_GRID_HOVER : COR_GRID;
      ctx.fill();
      ctx.strokeStyle = COR_GRID_BORDA;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

export function desenharCuboToken(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  sprite: SpriteConfig,
  tileH: number,
) {
  const alturaCubo = tileH * 0.9;
  const larguraCubo = tileH * 0.7;
  const topo = centerY - alturaCubo * 0.6;

  const corTopo = clarearCor(sprite.roupa, 1.2);
  const corEsquerda = escurecerCor(sprite.roupa, 0.65);
  const corDireita = escurecerCor(sprite.roupa, 0.85);

  // Face esquerda
  ctx.beginPath();
  ctx.moveTo(centerX - larguraCubo / 2, topo + alturaCubo * 0.35);
  ctx.lineTo(centerX, topo + alturaCubo * 0.55);
  ctx.lineTo(centerX, topo + alturaCubo);
  ctx.lineTo(centerX - larguraCubo / 2, topo + alturaCubo * 0.8);
  ctx.closePath();
  ctx.fillStyle = corEsquerda;
  ctx.fill();
  ctx.strokeStyle = "#0d0d1a";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Face direita
  ctx.beginPath();
  ctx.moveTo(centerX + larguraCubo / 2, topo + alturaCubo * 0.35);
  ctx.lineTo(centerX, topo + alturaCubo * 0.55);
  ctx.lineTo(centerX, topo + alturaCubo);
  ctx.lineTo(centerX + larguraCubo / 2, topo + alturaCubo * 0.8);
  ctx.closePath();
  ctx.fillStyle = corDireita;
  ctx.fill();
  ctx.stroke();

  // Face superior
  ctx.beginPath();
  ctx.moveTo(centerX, topo);
  ctx.lineTo(centerX + larguraCubo / 2, topo + alturaCubo * 0.35);
  ctx.lineTo(centerX, topo + alturaCubo * 0.55);
  ctx.lineTo(centerX - larguraCubo / 2, topo + alturaCubo * 0.35);
  ctx.closePath();
  ctx.fillStyle = corTopo;
  ctx.fill();
  ctx.stroke();

  // Cabeça pixel (pele + cabelo)
  const cabecaY = topo - 4;
  ctx.fillStyle = sprite.pele;
  ctx.fillRect(centerX - 5, cabecaY - 8, 10, 8);
  ctx.fillStyle = sprite.cabelo;
  ctx.fillRect(centerX - 5, cabecaY - 10, 10, 3);
}

export function desenharBarraPv(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  pvAtual: number,
  pvMax: number,
  largura = 36,
) {
  const altura = 4;
  const x = centerX - largura / 2;
  const y = topY - 14;
  const ratio = pvMax > 0 ? Math.max(0, Math.min(1, pvAtual / pvMax)) : 0;

  ctx.fillStyle = COR_HP_FUNDO;
  ctx.fillRect(x, y, largura, altura);
  ctx.fillStyle = COR_HP;
  ctx.fillRect(x, y, largura * ratio, altura);
  ctx.strokeStyle = "#0d0d1a";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, largura, altura);
}

export function desenharBarraPm(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  pmAtual: number,
  pmMax: number,
  largura = 36,
) {
  const altura = 3;
  const x = centerX - largura / 2;
  const y = topY - 8;
  const ratio = pmMax > 0 ? Math.max(0, Math.min(1, pmAtual / pmMax)) : 0;

  ctx.fillStyle = COR_HP_FUNDO;
  ctx.fillRect(x, y, largura, altura);
  ctx.fillStyle = COR_MP;
  ctx.fillRect(x, y, largura * ratio, altura);
}

export function desenharToken(
  ctx: CanvasRenderingContext2D,
  token: TokenNoTabuleiro,
  config: ConfigTabuleiro,
  offsetX: number,
  offsetY: number,
  mostrarPm: boolean,
  selecionado: boolean,
) {
  if (!token.visivel) return;

  const { x, y } = gridParaTela(
    token.gridX,
    token.gridY,
    config.tileLargura,
    config.tileAltura,
    offsetX,
    offsetY,
  );

  desenharBarraPv(ctx, x, y - config.tileAltura / 2, token.ficha.pvAtual, token.ficha.pvMax);
  if (mostrarPm && token.ficha.pmMax > 0) {
    desenharBarraPm(ctx, x, y - config.tileAltura / 2, token.ficha.pmAtual, token.ficha.pmMax);
  }

  desenharCuboToken(ctx, x, y, token.ficha.spriteConfig, config.tileAltura);

  if (selecionado) {
    ctx.strokeStyle = "#f4d03f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, config.tileAltura * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#e8e8f0";
  ctx.font = "6px monospace";
  ctx.textAlign = "center";
  const nome =
    token.ficha.nome.length > 10
      ? `${token.ficha.nome.slice(0, 9)}…`
      : token.ficha.nome;
  ctx.fillText(nome, x, y + config.tileAltura * 0.55);
}

export function pontoEmLosango(
  px: number,
  py: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
): boolean {
  const dx = Math.abs(px - cx) / hw;
  const dy = Math.abs(py - cy) / hh;
  return dx + dy <= 1;
}

export function encontrarTokenNoPonto(
  tokens: TokenNoTabuleiro[],
  px: number,
  py: number,
  config: ConfigTabuleiro,
  offsetX: number,
  offsetY: number,
): TokenNoTabuleiro | null {
  const ordenados = [...tokens].sort(
    (a, b) => b.gridX + b.gridY - (a.gridX + a.gridY),
  );
  const hw = config.tileLargura / 2;
  const hh = config.tileAltura;

  for (const token of ordenados) {
    if (!token.visivel) continue;
    const { x, y } = gridParaTela(
      token.gridX,
      token.gridY,
      config.tileLargura,
      config.tileAltura,
      offsetX,
      offsetY,
    );
    if (pontoEmLosango(px, py, x, y - hh * 0.2, hw, hh * 0.5)) {
      return token;
    }
  }
  return null;
}

export function mapFichaNoTabuleiro(row: Record<string, unknown>): FichaNoTabuleiro {
  return {
    id: row.id as string,
    nome: row.nome as string,
    tipo: row.tipo as FichaNoTabuleiro["tipo"],
    donoId: (row.dono_id as string | null) ?? null,
    pvAtual: row.pv_atual as number,
    pvMax: row.pv_max as number,
    pmAtual: row.pm_atual as number,
    pmMax: row.pm_max as number,
    spriteConfig: parseSpriteConfig(row.sprite_config),
  };
}
