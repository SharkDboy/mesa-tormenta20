"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ConfigTabuleiro, TokenNoTabuleiro } from "@/lib/board/types";
import { gridParaTela, telaParaGrid } from "@/lib/board/isometric";
import {
  calcularOffsetTabuleiro,
  clampGrid,
  ordenarTokensPorProfundidade,
  parseSpriteConfig,
} from "@/lib/board/utils";
import {
  desenharGrid,
  desenharToken,
  encontrarTokenNoPonto,
  mapFichaNoTabuleiro,
} from "@/lib/board/desenhar";
import { atualizarPosicaoToken } from "@/lib/board/actions";

interface ArrasteState {
  posicaoId: string;
  offsetMouseX: number;
  offsetMouseY: number;
  previewGridX: number;
  previewGridY: number;
}

interface PanState {
  pointerId: number;
  startMouseX: number;
  startMouseY: number;
  startPanX: number;
  startPanY: number;
}

interface IsometricBoardProps {
  campanhaId: string;
  config: ConfigTabuleiro;
  tokensInicial: TokenNoTabuleiro[];
  userId: string;
  ehMestre: boolean;
}

const DEBOUNCE_MS = 200;

export function IsometricBoard({
  campanhaId,
  config,
  tokensInicial,
  userId,
  ehMestre,
}: IsometricBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState(tokensInicial);
  const [tamanho, setTamanho] = useState({ w: 800, h: 520 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState<PanState | null>(null);
  const [arraste, setArraste] = useState<ArrasteState | null>(null);
  const [hoverCelula, setHoverCelula] = useState<{
    gridX: number;
    gridY: number;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMoveRef = useRef<{
    posicaoId: string;
    gridX: number;
    gridY: number;
  } | null>(null);

  useEffect(() => {
    setTokens(tokensInicial);
  }, [tokensInicial]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setTamanho({
          w: Math.max(320, entry.contentRect.width),
          h: Math.max(400, entry.contentRect.height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const offset = calcularOffsetTabuleiro(config, tamanho.w, tamanho.h);
  const cameraOffsetX = offset.offsetX + pan.x;
  const cameraOffsetY = offset.offsetY + pan.y;

  const podeArrastar = useCallback(
    (token: TokenNoTabuleiro) => {
      if (!token.visivel) return false;
      if (ehMestre) return true;
      return token.ficha.donoId === userId;
    },
    [ehMestre, userId],
  );

  const tokensParaDesenho = tokens.map((t) => {
    if (arraste && arraste.posicaoId === t.posicaoId) {
      return { ...t, gridX: arraste.previewGridX, gridY: arraste.previewGridY };
    }
    return t;
  });

  const redesenhar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = tamanho.w * dpr;
    canvas.height = tamanho.h * dpr;
    canvas.style.width = `${tamanho.w}px`;
    canvas.style.height = `${tamanho.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#16213e";
    ctx.fillRect(0, 0, tamanho.w, tamanho.h);

    desenharGrid(ctx, config, cameraOffsetX, cameraOffsetY, hoverCelula);

    const ordenados = ordenarTokensPorProfundidade(tokensParaDesenho);
    for (const token of ordenados) {
      desenharToken(
        ctx,
        token,
        config,
        cameraOffsetX,
        cameraOffsetY,
        ehMestre,
        arraste?.posicaoId === token.posicaoId,
      );
    }
  }, [
    tamanho,
    config,
    cameraOffsetX,
    cameraOffsetY,
    hoverCelula,
    tokensParaDesenho,
    ehMestre,
    arraste,
  ]);

  useEffect(() => {
    redesenhar();
  }, [redesenhar]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`tabuleiro-${campanhaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posicoes_token",
          filter: `campanha_id=eq.${campanhaId}`,
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string };
            if (old.id) {
              setTokens((prev) => prev.filter((t) => t.posicaoId !== old.id));
            }
            return;
          }

          const row = payload.new as {
            id: string;
            ficha_id: string;
            grid_x: number;
            grid_y: number;
            visivel: boolean;
          };

          // UPDATE: reutiliza ficha em cache — evita fetch extra por movimento
          if (payload.eventType === "UPDATE") {
            setTokens((prev) => {
              const idx = prev.findIndex((t) => t.posicaoId === row.id);
              if (idx < 0) return prev;
              const next = [...prev];
              next[idx] = {
                ...next[idx],
                gridX: row.grid_x,
                gridY: row.grid_y,
                visivel: row.visivel,
              };
              return next;
            });
            return;
          }

          const { data: ficha } = await supabase
            .from("fichas_t20")
            .select(
              "id, nome, tipo, dono_id, pv_atual, pv_max, pm_atual, pm_max, sprite_config",
            )
            .eq("id", row.ficha_id)
            .maybeSingle();

          if (!ficha) return;

          const token: TokenNoTabuleiro = {
            posicaoId: row.id,
            fichaId: row.ficha_id,
            gridX: row.grid_x,
            gridY: row.grid_y,
            visivel: row.visivel,
            ficha: mapFichaNoTabuleiro(ficha),
          };

          setTokens((prev) => {
            const idx = prev.findIndex((t) => t.posicaoId === row.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = token;
              return next;
            }
            return [...prev, token];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fichas_t20",
          filter: `campanha_id=eq.${campanhaId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const fichaId = row.id as string;
          setTokens((prev) =>
            prev.map((t) =>
              t.fichaId === fichaId
                ? {
                    ...t,
                    ficha: {
                      ...t.ficha,
                      nome: row.nome as string,
                      pvAtual: row.pv_atual as number,
                      pvMax: row.pv_max as number,
                      pmAtual: row.pm_atual as number,
                      pmMax: row.pm_max as number,
                      spriteConfig: parseSpriteConfig(row.sprite_config),
                    },
                  }
                : t,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fichas_t20",
          filter: `campanha_id=eq.${campanhaId}`,
        },
        async (payload) => {
          const ficha = payload.new as Record<string, unknown>;
          const fichaId = ficha.id as string;

          const { data: posicao } = await supabase
            .from("posicoes_token")
            .select("id, grid_x, grid_y, visivel")
            .eq("ficha_id", fichaId)
            .maybeSingle();

          if (!posicao) return;

          const token: TokenNoTabuleiro = {
            posicaoId: posicao.id,
            fichaId,
            gridX: posicao.grid_x,
            gridY: posicao.grid_y,
            visivel: posicao.visivel,
            ficha: mapFichaNoTabuleiro(ficha),
          };

          setTokens((prev) => {
            if (prev.some((t) => t.posicaoId === posicao.id)) return prev;
            return [...prev, token];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [campanhaId]);

  function coordenadasCanvas(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  async function enviarPosicao(posicaoId: string, gridX: number, gridY: number) {
    const clamped = clampGrid(gridX, gridY, config);
    pendingMoveRef.current = {
      posicaoId,
      gridX: clamped.gridX,
      gridY: clamped.gridY,
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const pending = pendingMoveRef.current;
      if (!pending) return;

      setTokens((prev) =>
        prev.map((t) =>
          t.posicaoId === pending.posicaoId
            ? { ...t, gridX: pending.gridX, gridY: pending.gridY }
            : t,
        ),
      );

      const resultado = await atualizarPosicaoToken(
        campanhaId,
        pending.posicaoId,
        pending.gridX,
        pending.gridY,
      );

      if (!resultado.ok) {
        setErro(resultado.error ?? "Erro ao mover token.");
      } else {
        setErro(null);
      }
      pendingMoveRef.current = null;
    }, DEBOUNCE_MS);
  }

  function iniciarPan(
    e: React.PointerEvent<HTMLCanvasElement>,
    x: number,
    y: number,
  ) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanning({
      pointerId: e.pointerId,
      startMouseX: x,
      startMouseY: y,
      startPanX: pan.x,
      startPanY: pan.y,
    });
    setArraste(null);
  }

  function finalizarPan(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!panning) return;
    setPanning(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = coordenadasCanvas(e.clientX, e.clientY);
    const token = encontrarTokenNoPonto(
      tokens,
      x,
      y,
      config,
      cameraOffsetX,
      cameraOffsetY,
    );

    const botaoEsquerdo = e.button === 0;
    const botaoMeio = e.button === 1;
    const podeArrastarToken = Boolean(token && podeArrastar(token));

    if (botaoEsquerdo && podeArrastarToken && token) {
      e.currentTarget.setPointerCapture(e.pointerId);

      const centro = gridParaTela(
        token.gridX,
        token.gridY,
        config.tileLargura,
        config.tileAltura,
        cameraOffsetX,
        cameraOffsetY,
      );

      setPanning(null);
      setArraste({
        posicaoId: token.posicaoId,
        offsetMouseX: x - centro.x,
        offsetMouseY: y - centro.y,
        previewGridX: token.gridX,
        previewGridY: token.gridY,
      });
      return;
    }

    if (botaoEsquerdo || botaoMeio) {
      e.preventDefault();
      iniciarPan(e, x, y);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = coordenadasCanvas(e.clientX, e.clientY);

    if (panning) {
      const deltaX = x - panning.startMouseX;
      const deltaY = y - panning.startMouseY;
      setPan({
        x: panning.startPanX + deltaX,
        y: panning.startPanY + deltaY,
      });
      return;
    }

    const grid = telaParaGrid(
      x,
      y,
      config.tileLargura,
      config.tileAltura,
      cameraOffsetX,
      cameraOffsetY,
    );
    const clamped = clampGrid(grid.gridX, grid.gridY, config);
    setHoverCelula(clamped);

    if (!arraste) return;

    const alvo = telaParaGrid(
      x - arraste.offsetMouseX,
      y - arraste.offsetMouseY,
      config.tileLargura,
      config.tileAltura,
      cameraOffsetX,
      cameraOffsetY,
    );
    const destino = clampGrid(alvo.gridX, alvo.gridY, config);

    setArraste((prev) =>
      prev
        ? {
            ...prev,
            previewGridX: destino.gridX,
            previewGridY: destino.gridY,
          }
        : null,
    );
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (panning) {
      finalizarPan(e);
      return;
    }

    if (!arraste) return;

    const tokenOriginal = tokens.find((t) => t.posicaoId === arraste.posicaoId);
    if (
      tokenOriginal &&
      (tokenOriginal.gridX !== arraste.previewGridX ||
        tokenOriginal.gridY !== arraste.previewGridY)
    ) {
      void enviarPosicao(
        arraste.posicaoId,
        arraste.previewGridX,
        arraste.previewGridY,
      );
    }

    setArraste(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLCanvasElement>) {
    setHoverCelula(null);
    if (panning) finalizarPan(e);
  }

  const cursorCanvas = panning
    ? "cursor-grabbing"
    : arraste
      ? "cursor-grabbing"
      : "cursor-grab";

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-none ${cursorCanvas}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Tabuleiro isométrico"
      />
      {erro && (
        <p className="absolute bottom-2 left-2 right-2 text-[6px] text-hp bg-surface/90 p-2">
          {erro}
        </p>
      )}
      {arraste && (
        <p className="absolute top-2 left-2 text-[6px] text-accent bg-surface/80 px-2 py-1">
          {arraste.previewGridX}, {arraste.previewGridY}
        </p>
      )}
      {!arraste && !panning && (
        <p className="absolute bottom-2 right-2 text-[5px] text-foreground/30 bg-surface/60 px-2 py-1 pointer-events-none">
          Arraste o mapa (clique vazio) · Botão do meio · Tokens com clique esquerdo
        </p>
      )}
    </div>
  );
}
