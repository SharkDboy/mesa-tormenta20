"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { entrarCampanha } from "@/lib/campanhas/actions";

export function EntrarCodigoForm() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resultado = await entrarCampanha(codigo);
      if (!resultado.ok || !resultado.data) {
        setErro(resultado.error ?? "Não foi possível entrar na campanha.");
        return;
      }

      router.push(`/campanha/${resultado.data.campanhaId}`);
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pixel-border bg-surface-light p-6">
      <h2 className="text-[9px] mb-2 text-accent">ENTRAR EM CAMPANHA</h2>
      <p className="text-[7px] text-foreground/50 mb-4 leading-4">
        Insira o código de acesso de 6 caracteres fornecido pelo mestre.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          className="pixel-input pixel-input-lg flex-1 text-center tracking-[0.3em] uppercase"
          placeholder="ABC123"
          maxLength={6}
          required
          aria-label="Código de acesso"
        />
        <button
          type="submit"
          disabled={carregando || codigo.trim().length < 6}
          className="pixel-btn text-[8px] sm:min-w-[120px] disabled:opacity-50"
        >
          {carregando ? "..." : "Entrar"}
        </button>
      </form>

      {erro && (
        <p className="text-[7px] text-hp mt-3 leading-4" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
