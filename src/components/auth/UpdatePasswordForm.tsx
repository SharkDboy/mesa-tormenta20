"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();

    async function prepararSessao() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (ativo) {
              setErro(
                "Link inválido ou expirado. Solicite uma nova recuperação de senha.",
              );
            }
            return;
          }
          // Remove o code da URL após trocar a sessão
          window.history.replaceState({}, "", "/auth/update-password");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!ativo) return;

        if (!session) {
          setErro(
            "Sessão de recuperação não encontrada. Abra o link do e-mail novamente.",
          );
          return;
        }

        setPronto(true);
      } finally {
        if (ativo) setVerificando(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && ativo) {
        setPronto(true);
        setVerificando(false);
        setErro(null);
      }
    });

    void prepararSessao();

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        setErro(error.message);
        return;
      }

      setMensagem("Senha atualizada! Redirecionando para o painel...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1800);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pixel-border bg-surface p-8 max-w-sm w-full">
      <p className="text-[8px] text-accent text-center mb-2">TORMENTA20</p>
      <h1 className="text-xs mb-2 text-center">NOVA SENHA</h1>
      <p className="text-[6px] text-foreground/40 text-center mb-6 leading-4">
        Defina uma senha forte para proteger sua conta de herói.
      </p>

      {verificando && (
        <p className="text-[7px] text-foreground/50 text-center">
          Verificando link de recuperação...
        </p>
      )}

      {!verificando && erro && !pronto && (
        <div className="flex flex-col gap-4">
          <p className="text-[7px] text-hp leading-4" role="alert">
            {erro}
          </p>
          <Link
            href="/login"
            className="pixel-btn text-[8px] text-center w-full"
          >
            Voltar ao login
          </Link>
        </div>
      )}

      {!verificando && pronto && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[7px] text-foreground/60">Nova senha</span>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="pixel-input"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={Boolean(mensagem)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[7px] text-foreground/60">
              Confirme a nova senha
            </span>
            <input
              type="password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              className="pixel-input"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={Boolean(mensagem)}
            />
          </label>

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
            disabled={carregando || Boolean(mensagem)}
            className="pixel-btn text-[8px] w-full disabled:opacity-50"
          >
            {carregando ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="block text-[7px] text-center text-accent/80 hover:text-accent mt-6"
      >
        ← Voltar ao login
      </Link>
    </div>
  );
}
