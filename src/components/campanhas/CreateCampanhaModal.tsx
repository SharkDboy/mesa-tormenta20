"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarCampanha } from "@/lib/campanhas/actions";

interface CreateCampanhaModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export function CreateCampanhaModal({ aberto, onFechar }: CreateCampanhaModalProps) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!aberto) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resultado = await criarCampanha(nome, discordUrl);
      if (!resultado.ok || !resultado.data) {
        setErro(resultado.error ?? "Erro ao criar campanha.");
        return;
      }

      setNome("");
      setDiscordUrl("");
      onFechar();
      router.push(`/campanha/${resultado.data.id}`);
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-criar-titulo"
    >
      <div className="pixel-border bg-surface p-6 w-full max-w-md">
        <h2 id="modal-criar-titulo" className="text-[10px] mb-4">
          NOVA CAMPANHA
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[7px] text-foreground/60">Nome da campanha</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="pixel-input"
              placeholder="A Lenda de Arton"
              required
              minLength={2}
              maxLength={80}
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[7px] text-foreground/60">
              URL do Webhook do Discord (opcional)
            </span>
            <input
              type="url"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className="pixel-input"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </label>

          {erro && (
            <p className="text-[7px] text-hp leading-4" role="alert">
              {erro}
            </p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onFechar}
              className="pixel-btn pixel-btn-secondary flex-1 text-[8px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="pixel-btn flex-1 text-[8px] disabled:opacity-50"
            >
              {carregando ? "Criando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
