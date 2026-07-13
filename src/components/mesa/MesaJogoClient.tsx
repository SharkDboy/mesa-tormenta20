"use client";

import Link from "next/link";
import type { RolagemRegistro } from "@/lib/rolagens/types";
import type { FichaT20 } from "@/types/t20";
import type { ConfigTabuleiro, TokenNoTabuleiro } from "@/lib/board/types";
import { DicePanel } from "@/components/rolagem/DicePanel";
import { IsometricBoard } from "@/components/board/IsometricBoard";
import { GmBoardPanel } from "@/components/board/GmBoardPanel";

interface MesaJogoClientProps {
  campanhaId: string;
  campanhaNome: string;
  configTabuleiro: ConfigTabuleiro;
  tokensInicial: TokenNoTabuleiro[];
  fichaJogador: FichaT20 | null;
  historicoInicial: RolagemRegistro[];
  userId: string;
  ehMestre: boolean;
}

export function MesaJogoClient({
  campanhaId,
  campanhaNome,
  configTabuleiro,
  tokensInicial,
  fichaJogador,
  historicoInicial,
  userId,
  ehMestre,
}: MesaJogoClientProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[7px] text-accent mb-1">{campanhaNome}</p>
          <h1 className="text-xs">MESA VIRTUAL</h1>
          <p className="text-[7px] text-foreground/50 mt-1">
            Tabuleiro isométrico · sincronizado em tempo real
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {fichaJogador && (
            <Link
              href={`/campanha/${campanhaId}/ficha`}
              className="text-[7px] text-accent/80 hover:text-accent"
            >
              Editar Ficha
            </Link>
          )}
          <Link
            href={`/campanha/${campanhaId}`}
            className="text-[7px] text-accent/80 hover:text-accent"
          >
            ← Campanha
          </Link>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-start">
        <div className="pixel-border bg-surface flex-1 w-full min-h-[440px] h-[55vh] relative overflow-hidden">
          <IsometricBoard
            campanhaId={campanhaId}
            config={configTabuleiro}
            tokensInicial={tokensInicial}
            userId={userId}
            ehMestre={ehMestre}
          />
          {ehMestre && <GmBoardPanel campanhaId={campanhaId} />}
        </div>

        <DicePanel
          campanhaId={campanhaId}
          historicoInicial={historicoInicial}
          contextoFicha={
            fichaJogador
              ? {
                  fichaId: fichaJogador.id,
                  nomePersonagem: fichaJogador.nome,
                }
              : undefined
          }
        />
      </div>

      <p className="text-[6px] text-foreground/30 text-center">
        Arraste tokens · Jogadores movem o próprio · Mestre move todos · PV visível
        {ehMestre ? " · PM visível (GM)" : ""}
      </p>
    </div>
  );
}
