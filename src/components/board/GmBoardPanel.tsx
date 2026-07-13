"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adicionarMonstroNoMapa,
  limparMonstrosDerrotados,
} from "@/lib/board/actions";

interface GmBoardPanelProps {
  campanhaId: string;
}

export function GmBoardPanel({ campanhaId }: GmBoardPanelProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleAdicionarMonstro() {
    setCarregando("add");
    setErro(null);
    setMensagem(null);
    try {
      const resultado = await adicionarMonstroNoMapa(campanhaId);
      if (!resultado.ok) {
        setErro(resultado.error ?? "Erro ao adicionar monstro.");
        return;
      }
      setMensagem("Monstro adicionado ao mapa!");
      router.refresh();
    } finally {
      setCarregando(null);
    }
  }

  async function handleLimparDerrotados() {
    setCarregando("clear");
    setErro(null);
    setMensagem(null);
    try {
      const resultado = await limparMonstrosDerrotados(campanhaId);
      if (!resultado.ok) {
        setErro(resultado.error ?? "Erro ao limpar monstros.");
        return;
      }
      setMensagem(
        resultado.data?.removidos
          ? `${resultado.data.removidos} monstro(s) removido(s).`
          : "Nenhum monstro derrotado no mapa.",
      );
      router.refresh();
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div className="absolute top-3 right-3 z-10 pixel-border bg-surface/95 p-3 w-48 shadow-lg">
      <h3 className="text-[7px] text-accent mb-2">PAINEL DO MESTRE</h3>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={carregando !== null}
          onClick={handleAdicionarMonstro}
          className="pixel-btn text-[6px] disabled:opacity-50"
        >
          {carregando === "add" ? "..." : "+ Monstro no Mapa"}
        </button>
        <button
          type="button"
          disabled={carregando !== null}
          onClick={handleLimparDerrotados}
          className="pixel-btn pixel-btn-secondary text-[6px] disabled:opacity-50"
        >
          {carregando === "clear" ? "..." : "Limpar Derrotados"}
        </button>
      </div>
      {mensagem && (
        <p className="text-[5px] text-accent mt-2 leading-4">{mensagem}</p>
      )}
      {erro && (
        <p className="text-[5px] text-hp mt-2 leading-4" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
