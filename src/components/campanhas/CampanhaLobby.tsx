"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CampanhaDetalhe } from "@/lib/campanhas/types";
import { atualizarDiscordUrl } from "@/lib/campanhas/actions";

interface CampanhaLobbyProps {
  detalhe: CampanhaDetalhe;
}

export function CampanhaLobby({ detalhe }: CampanhaLobbyProps) {
  const { campanha, ehMestre, membros } = detalhe;
  const router = useRouter();
  const [discordUrl, setDiscordUrl] = useState(campanha.discord_url ?? "");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvarDiscord(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setMensagem(null);

    try {
      const resultado = await atualizarDiscordUrl(campanha.id, discordUrl);
      if (!resultado.ok) {
        setErro(resultado.error ?? "Erro ao salvar.");
        return;
      }
      setMensagem("URL do Discord atualizada.");
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  function copiarCodigo() {
    void navigator.clipboard.writeText(campanha.codigo_convite);
    setMensagem("Código copiado!");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="pixel-border bg-surface p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[7px] text-accent mb-1">
              {ehMestre ? "PAINEL DO MESTRE" : "SALA DO JOGADOR"}
            </p>
            <h1 className="text-xs">{campanha.nome}</h1>
            {campanha.descricao && (
              <p className="text-[7px] text-foreground/50 mt-2 leading-4">
                {campanha.descricao}
              </p>
            )}
          </div>
          {ehMestre && (
            <div className="pixel-border bg-surface-light p-3 text-center shrink-0">
              <p className="text-[6px] text-foreground/50 mb-1">CÓDIGO DE ACESSO</p>
              <p className="text-[10px] text-accent tracking-[0.25em]">
                {campanha.codigo_convite}
              </p>
              <button
                type="button"
                onClick={copiarCodigo}
                className="text-[6px] text-foreground/60 hover:text-accent mt-2"
              >
                Copiar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="pixel-border bg-surface p-6">
          <h2 className="text-[8px] mb-4">MEMBROS ({membros.length})</h2>
          <ul className="flex flex-col gap-2">
            {membros.map((membro) => (
              <li
                key={membro.id}
                className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 last:border-0"
              >
                <span className="text-[7px]">{membro.usuario.nome_exibicao}</span>
                <span className="text-[6px] text-foreground/40 uppercase">
                  {membro.papel === "gm" ? "Mestre" : "Jogador"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pixel-border bg-surface p-6">
          <h2 className="text-[8px] mb-4">
            {ehMestre ? "FERRAMENTAS DO MESTRE" : "SUA FICHA"}
          </h2>

          {ehMestre ? (
            <div className="flex flex-col gap-3">
              <p className="text-[7px] text-foreground/50 leading-4">
                Gerencie NPCs, monstros e sua ficha de mestre.
              </p>
              <Link
                href={`/campanha/${campanha.id}/ficha`}
                className="pixel-btn text-[8px] text-center"
              >
                Minha Ficha / NPCs
              </Link>
              <form onSubmit={handleSalvarDiscord} className="flex flex-col gap-2 mt-2">
                <label className="text-[7px] text-foreground/60">
                  URL do Webhook do Discord
                </label>
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="pixel-input"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <button
                  type="submit"
                  disabled={salvando}
                  className="pixel-btn pixel-btn-secondary text-[7px] self-start disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Salvar Discord"}
                </button>
              </form>
              {discordUrl && (
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[7px] text-accent hover:underline"
                >
                  Abrir link do Discord →
                </a>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[7px] text-foreground/50 leading-4">
                Crie ou edite sua ficha de personagem Tormenta20.
              </p>
              <Link
                href={`/campanha/${campanha.id}/ficha`}
                className="pixel-btn text-[8px] text-center"
              >
                Minha Ficha
              </Link>
            </div>
          )}

          {mensagem && (
            <p className="text-[7px] text-accent mt-3">{mensagem}</p>
          )}
          {erro && (
            <p className="text-[7px] text-hp mt-3" role="alert">
              {erro}
            </p>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/campanha/${campanha.id}/mesa`}
          className="pixel-btn pixel-btn-secondary text-[8px] text-center flex-1"
        >
          Ir para a Mesa
        </Link>
        <Link
          href="/dashboard"
          className="text-[7px] text-center text-accent/80 hover:text-accent py-3"
        >
          ← Voltar ao Lobby
        </Link>
      </div>
    </div>
  );
}
