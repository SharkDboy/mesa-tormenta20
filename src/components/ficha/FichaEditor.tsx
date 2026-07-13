"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FichaT20, TipoFicha } from "@/types/t20";
import type { FichaResumo, AbaFicha, FichaFormData } from "@/lib/fichas/types";
import type { RolagemRegistro } from "@/lib/rolagens/types";
import { fichaParaFormulario, formularioPadrao } from "@/lib/fichas/types";
import { salvarFicha } from "@/lib/fichas/actions";
import { renderizarSpriteCanvas } from "@/lib/sprite/pixel-avatar";
import { useRolagem } from "@/hooks/useRolagem";
import { DicePanel } from "@/components/rolagem/DicePanel";
import { FichaTabs } from "./FichaTabs";
import { FichaAtributosTab } from "./FichaAtributosTab";
import { FichaRegistroTab } from "./FichaRegistroTab";
import { FichaInventarioTab } from "./FichaInventarioTab";
import { SpriteCustomizer } from "./SpriteCustomizer";

interface FichaEditorProps {
  campanhaId: string;
  campanhaNome: string;
  fichaId?: string;
  fichaInicial?: FichaT20 | null;
  tipoInicial: TipoFicha;
  ehMestre: boolean;
  npcsMonstros: FichaResumo[];
  historicoInicial: RolagemRegistro[];
}

export function FichaEditor({
  campanhaId,
  campanhaNome,
  fichaId,
  fichaInicial,
  tipoInicial,
  ehMestre,
  npcsMonstros,
  historicoInicial,
}: FichaEditorProps) {
  const router = useRouter();
  const rolagem = useRolagem(campanhaId);
  const [abaAtiva, setAbaAtiva] = useState<AbaFicha>("atributos");
  const [dados, setDados] = useState<FichaFormData>(() =>
    fichaInicial
      ? fichaParaFormulario(fichaInicial)
      : formularioPadrao(tipoInicial),
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const chaveFicha = fichaInicial
    ? `${fichaInicial.id}:${fichaInicial.atualizado_em ?? ""}`
    : `novo:${tipoInicial}`;

  useEffect(() => {
    setDados(
      fichaInicial
        ? fichaParaFormulario(fichaInicial)
        : formularioPadrao(tipoInicial),
    );
    setAbaAtiva("atributos");
    setErro(null);
    setMensagem(null);
  }, [chaveFicha, fichaInicial, tipoInicial]);

  const modoEdicao = Boolean(fichaId || fichaInicial);
  const visualizandoMinhaPc =
    Boolean(fichaInicial?.tipo === "pc") &&
    !npcsMonstros.some((f) => f.id === fichaId);
  const podeAlterarTipo = ehMestre && !fichaInicial?.dono_id;
  const idFichaAtual = fichaId ?? fichaInicial?.id;
  const podeRolar = Boolean(idFichaAtual && dados.nome.trim());

  function atualizarDados(parcial: Partial<FichaFormData>) {
    setDados((prev) => ({ ...prev, ...parcial }));
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setMensagem(null);

    try {
      const tokenUrl = renderizarSpriteCanvas(dados.sprite_config, 8);
      const resultado = await salvarFicha(
        campanhaId,
        dados,
        fichaId ?? fichaInicial?.id,
        tokenUrl,
      );

      if (!resultado.ok) {
        setErro(resultado.error ?? "Erro ao salvar personagem.");
        return;
      }

      setMensagem("Personagem salvo com sucesso!");
      if (!modoEdicao && resultado.data?.fichaId) {
        router.replace(
          `/campanha/${campanhaId}/ficha?fichaId=${resultado.data.fichaId}`,
        );
      }
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function handleRolar(teste: string, expressao: string) {
    await rolagem.rolar({
      fichaId: idFichaAtual,
      nomePersonagem: dados.nome.trim() || "Sem nome",
      teste,
      expressao,
    });
  }

  function classeLinkGm(ativo: boolean) {
    return `text-[7px] px-3 py-2 border-2 ${
      ativo
        ? "border-accent text-accent bg-surface"
        : "border-border hover:border-accent"
    }`;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[7px] text-accent mb-1">{campanhaNome}</p>
          <h1 className="text-xs">
            {modoEdicao ? "EDITAR FICHA" : "NOVA FICHA T20"}
          </h1>
          <p className="text-[7px] text-foreground/50 mt-1">
            {dados.tipo === "pc"
              ? "Personagem do jogador"
              : dados.tipo === "npc"
                ? "NPC"
                : "Monstro"}
          </p>
        </div>
        <Link
          href={`/campanha/${campanhaId}`}
          className="text-[7px] text-accent/80 hover:text-accent"
        >
          ← Voltar à campanha
        </Link>
      </div>

      {ehMestre && (
        <section className="pixel-border bg-surface p-4">
          <h2 className="text-[8px] mb-3">FICHAS DA CAMPANHA (GM)</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/campanha/${campanhaId}/ficha`}
              className={classeLinkGm(visualizandoMinhaPc)}
            >
              Minha ficha PC
            </Link>
            <Link
              href={`/campanha/${campanhaId}/ficha?novo=npc`}
              className={classeLinkGm(false)}
            >
              + Novo NPC
            </Link>
            <Link
              href={`/campanha/${campanhaId}/ficha?novo=monstro`}
              className={classeLinkGm(false)}
            >
              + Novo Monstro
            </Link>
            {npcsMonstros.map((f) => (
              <Link
                key={f.id}
                href={`/campanha/${campanhaId}/ficha?fichaId=${f.id}`}
                className={classeLinkGm(fichaId === f.id)}
              >
                {f.nome} ({f.tipo})
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <form onSubmit={handleSalvar} className="pixel-border bg-surface p-5 flex flex-col gap-5">
          <FichaTabs abaAtiva={abaAtiva} onChange={setAbaAtiva} />

          {abaAtiva === "atributos" && (
            <FichaAtributosTab
              dados={dados}
              onChange={atualizarDados}
              podeRolar={podeRolar}
              rolagemCarregando={rolagem.carregando}
              onRolar={handleRolar}
            />
          )}
          {abaAtiva === "registro" && (
            <FichaRegistroTab
              dados={dados}
              onChange={atualizarDados}
              podeAlterarTipo={podeAlterarTipo}
            />
          )}
          {abaAtiva === "inventario" && (
            <FichaInventarioTab dados={dados} onChange={atualizarDados} />
          )}

          {erro && (
            <p className="text-[7px] text-hp leading-4" role="alert">
              {erro}
            </p>
          )}
          {mensagem && (
            <p className="text-[7px] text-accent leading-4">{mensagem}</p>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="pixel-btn text-[8px] w-full sm:w-auto self-start disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar Personagem"}
          </button>
        </form>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <SpriteCustomizer
            key={chaveFicha}
            config={dados.sprite_config}
            onChange={(sprite_config) => atualizarDados({ sprite_config })}
          />
          <DicePanel
            campanhaId={campanhaId}
            historicoInicial={historicoInicial}
            rolagem={rolagem}
            titulo="ROLADOR"
            contextoFicha={
              podeRolar
                ? {
                    fichaId: idFichaAtual,
                    nomePersonagem: dados.nome.trim(),
                  }
                : undefined
            }
          />
        </aside>
      </div>
    </div>
  );
}
