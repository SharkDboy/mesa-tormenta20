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
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [erroRecuperacao, setErroRecuperacao] = useState<string | null>(null);
  const [sucessoRecuperacao, setSucessoRecuperacao] = useState<string | null>(
    null,
  );

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

  async function handleRecuperacao(e: React.FormEvent) {
    e.preventDefault();
    setErroRecuperacao(null);
    setSucessoRecuperacao(null);

    const emailAlvo = emailRecuperacao.trim();
    if (!emailAlvo) {
      setErroRecuperacao("Informe o e-mail da sua conta.");
      return;
    }

    setEnviandoRecuperacao(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(emailAlvo, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        setErroRecuperacao(error.message);
        return;
      }

      setSucessoRecuperacao(
        "Link enviado! Confira sua caixa de entrada (e o spam) para redefinir a senha.",
      );
    } finally {
      setEnviandoRecuperacao(false);
    }
  }

  function fecharRecuperacao() {
    setMostrarRecuperacao(false);
    setErroRecuperacao(null);
    setSucessoRecuperacao(null);
  }

  return (
    <div className="relative pixel-border bg-surface p-8 max-w-sm w-full">
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

        {modo === "login" && (
          <button
            type="button"
            onClick={() => {
              setMostrarRecuperacao(true);
              setEmailRecuperacao(email);
              setErroRecuperacao(null);
              setSucessoRecuperacao(null);
            }}
            className="text-[6px] text-left text-accent/80 hover:text-accent -mt-1"
          >
            Esqueci minha senha
          </button>
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

      {mostrarRecuperacao && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-recuperacao"
        >
          <div className="pixel-border bg-surface p-5 w-full max-w-[280px]">
            <h2 id="titulo-recuperacao" className="text-[8px] text-accent mb-2">
              RECUPERAR SENHA
            </h2>
            <p className="text-[6px] text-foreground/40 leading-4 mb-4">
              Digite o e-mail da conta. Enviaremos um link mágico para criar uma
              nova senha.
            </p>

            <form onSubmit={handleRecuperacao} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[7px] text-foreground/60">E-mail</span>
                <input
                  type="email"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  className="pixel-input"
                  placeholder="heroi@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </label>

              {erroRecuperacao && (
                <p className="text-[6px] text-hp leading-4" role="alert">
                  {erroRecuperacao}
                </p>
              )}
              {sucessoRecuperacao && (
                <p className="text-[6px] text-accent leading-4">
                  {sucessoRecuperacao}
                </p>
              )}

              <button
                type="submit"
                disabled={enviandoRecuperacao || Boolean(sucessoRecuperacao)}
                className="pixel-btn text-[7px] w-full disabled:opacity-50"
              >
                {enviandoRecuperacao ? "Enviando..." : "Enviar link"}
              </button>
              <button
                type="button"
                onClick={fecharRecuperacao}
                className="text-[6px] text-foreground/50 hover:text-accent"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
