"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ModoAuth = "login" | "cadastro";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const modoInicial =
    searchParams.get("mode") === "cadastro" ? "cadastro" : "login";
  const erroCallback =
    searchParams.get("error") === "auth_callback"
      ? decodeURIComponent(
          searchParams.get("message") ?? "Falha na confirmação do e-mail.",
        )
      : null;

  const [modo, setModo] = useState<ModoAuth>(modoInicial);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeExibicao, setNomeExibicao] = useState("");
  const [erro, setErro] = useState<string | null>(erroCallback);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setCarregando(true);

    try {
      const supabase = createClient();

      if (modo === "cadastro") {
        const nome = nomeExibicao.trim();
        if (nome.length < 2) {
          setErro("Informe um nome de exibição com ao menos 2 caracteres.");
          return;
        }

        const origem = window.location.origin;
        const redirectAposConfirmacao = `${origem}/auth/callback?next=${encodeURIComponent(redirect)}`;

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: {
            data: { nome_exibicao: nome },
            emailRedirectTo: redirectAposConfirmacao,
          },
        });

        if (error) {
          setErro(error.message);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.push(redirect);
          router.refresh();
          return;
        }

        setMensagem(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
        );
        setModo("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      router.push(redirect);
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pixel-border bg-surface p-8 max-w-sm w-full">
      <p className="text-[8px] text-accent text-center mb-2">TORMENTA20</p>
      <h1 className="text-xs mb-6 text-center">
        {modo === "login" ? "ENTRAR" : "CRIAR CONTA"}
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setModo("login")}
          className={`flex-1 text-[7px] py-2 border-2 ${
            modo === "login"
              ? "border-accent text-accent bg-surface-light"
              : "border-border text-foreground/50"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setModo("cadastro")}
          className={`flex-1 text-[7px] py-2 border-2 ${
            modo === "cadastro"
              ? "border-accent text-accent bg-surface-light"
              : "border-border text-foreground/50"
          }`}
        >
          Cadastro
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {modo === "cadastro" && (
          <label className="flex flex-col gap-1">
            <span className="text-[7px] text-foreground/60">Nome de exibição</span>
            <input
              type="text"
              value={nomeExibicao}
              onChange={(e) => setNomeExibicao(e.target.value)}
              className="pixel-input"
              placeholder="Aragorn"
              required
              minLength={2}
              maxLength={40}
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pixel-input"
            placeholder="heroi@email.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="pixel-input"
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete={
              modo === "login" ? "current-password" : "new-password"
            }
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
          disabled={carregando}
          className="pixel-btn text-[8px] w-full disabled:opacity-50"
        >
          {carregando
            ? "Aguarde..."
            : modo === "login"
              ? "Entrar"
              : "Criar conta"}
        </button>
      </form>

      <Link
        href="/"
        className="block text-[7px] text-center text-accent/80 hover:text-accent mt-6"
      >
        ← Voltar ao início
      </Link>
    </div>
  );
}
