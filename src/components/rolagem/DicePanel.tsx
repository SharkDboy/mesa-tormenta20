"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RolagemRegistro } from "@/lib/rolagens/types";
import { useRolagem, type RolagemController } from "@/hooks/useRolagem";
import { montarExpressaoLivre } from "@/lib/t20/dados";
import { RolagemHistorico } from "./RolagemHistorico";

interface ContextoFicha {
  fichaId?: string;
  nomePersonagem: string;
}

interface DicePanelProps {
  campanhaId: string;
  historicoInicial: RolagemRegistro[];
  contextoFicha?: ContextoFicha;
  titulo?: string;
  /** Quando fornecido, compartilha o mesmo estado de rolagem do editor (evita histórico duplicado). */
  rolagem?: RolagemController;
}

export function DicePanel({
  campanhaId,
  historicoInicial,
  contextoFicha,
  titulo = "ROLADOR T20",
  rolagem: rolagemExterna,
}: DicePanelProps) {
  const rolagemInterna = useRolagem(campanhaId);
  const { rolar, carregando, erro, ultima } = rolagemExterna ?? rolagemInterna;
  const [historico, setHistorico] = useState(historicoInicial);
  const [quantidade, setQuantidade] = useState(1);
  const [lados, setLados] = useState(20);
  const [modificador, setModificador] = useState(0);

  const nomePadrao = contextoFicha?.nomePersonagem ?? "Jogador";

  useEffect(() => {
    setHistorico(historicoInicial);
  }, [historicoInicial]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`rolagens-${campanhaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rolagens",
          filter: `campanha_id=eq.${campanhaId}`,
        },
        (payload) => {
          const nova = payload.new as RolagemRegistro;
          setHistorico((prev) => {
            if (prev.some((r) => r.id === nova.id)) return prev;
            return [nova, ...prev].slice(0, 10);
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [campanhaId]);

  useEffect(() => {
    if (ultima) {
      setHistorico((prev) => {
        if (prev.some((r) => r.id === ultima.id)) return prev;
        return [ultima, ...prev].slice(0, 10);
      });
    }
  }, [ultima]);

  const expressaoPreview = useMemo(
    () => montarExpressaoLivre(quantidade, lados, modificador),
    [quantidade, lados, modificador],
  );

  async function handleRolagemLivre() {
    await rolar({
      fichaId: contextoFicha?.fichaId,
      nomePersonagem: nomePadrao,
      teste: "Rolagem livre",
      expressao: expressaoPreview,
    });
  }

  async function handleD20Puro() {
    await rolar({
      fichaId: contextoFicha?.fichaId,
      nomePersonagem: nomePadrao,
      teste: "d20",
      expressao: "1d20",
    });
  }

  return (
    <aside className="pixel-border bg-surface p-4 w-full lg:w-72 shrink-0 flex flex-col gap-4">
      <div>
        <h2 className="text-[8px] text-accent mb-1">{titulo}</h2>
        {contextoFicha && (
          <p className="text-[6px] text-foreground/50">
            Personagem: {contextoFicha.nomePersonagem}
          </p>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <p className="text-[7px] text-foreground/60">Rolagem livre</p>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[5px] text-foreground/40">Qtd</span>
            <input
              type="number"
              min={1}
              max={20}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="pixel-input text-center text-[7px] py-1"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[5px] text-foreground/40">Lados</span>
            <input
              type="number"
              min={2}
              max={100}
              value={lados}
              onChange={(e) => setLados(Number(e.target.value))}
              className="pixel-input text-center text-[7px] py-1"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[5px] text-foreground/40">Mod</span>
            <input
              type="number"
              value={modificador}
              onChange={(e) => setModificador(Number(e.target.value))}
              className="pixel-input text-center text-[7px] py-1"
            />
          </label>
        </div>
        <p className="text-[6px] text-foreground/40 text-center">
          {expressaoPreview}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={carregando}
            onClick={handleRolagemLivre}
            className="pixel-btn flex-1 text-[7px] disabled:opacity-50"
          >
            {carregando ? "..." : "Rolar"}
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={handleD20Puro}
            className="pixel-btn pixel-btn-secondary text-[7px] px-3 disabled:opacity-50"
          >
            d20
          </button>
        </div>
      </section>

      {ultima && (
        <div className="pixel-border bg-surface-light p-3 text-center">
          <p className="text-[6px] text-foreground/50 mb-1">Último resultado</p>
          <p className="text-[12px] text-accent">{ultima.total}</p>
          <p className="text-[6px] text-foreground/60 mt-1">{ultima.detalhes}</p>
        </div>
      )}

      {erro && (
        <p className="text-[6px] text-hp leading-4" role="alert">
          {erro}
        </p>
      )}

      <section>
        <h3 className="text-[7px] text-foreground/60 mb-2">
          Histórico (últimas 10)
        </h3>
        <RolagemHistorico historico={historico} />
      </section>
    </aside>
  );
}
