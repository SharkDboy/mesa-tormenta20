"use client";

import { useState } from "react";
import type { CampanhaComPapel } from "@/lib/campanhas/types";
import { CampanhaList } from "./CampanhaList";
import { CreateCampanhaModal } from "./CreateCampanhaModal";
import { EntrarCodigoForm } from "./EntrarCodigoForm";

interface DashboardClientProps {
  campanhasComoMestre: CampanhaComPapel[];
  campanhasComoJogador: CampanhaComPapel[];
}

export function DashboardClient({
  campanhasComoMestre,
  campanhasComoJogador,
}: DashboardClientProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xs mb-1">LOBBY</h1>
          <p className="text-[7px] text-foreground/50 leading-4">
            Gerencie suas mesas ou entre em uma campanha.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="pixel-btn text-[8px] shrink-0"
        >
          + Criar Nova Campanha
        </button>
      </div>

      <EntrarCodigoForm />

      <CampanhaList
        campanhas={campanhasComoMestre}
        titulo="MINHAS CAMPANHAS (MESTRE)"
        vazio="Você ainda não criou nenhuma campanha."
      />

      {campanhasComoJogador.length > 0 && (
        <CampanhaList
          campanhas={campanhasComoJogador}
          titulo="CAMPANHAS COMO JOGADOR"
        />
      )}

      <CreateCampanhaModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      />
    </div>
  );
}
