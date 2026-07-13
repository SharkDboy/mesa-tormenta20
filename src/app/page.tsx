import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <main className="flex max-w-lg flex-col items-center gap-8 text-center">
        <div className="pixel-border bg-surface p-8">
          <p className="mb-2 text-[10px] text-accent">TORMENTA20</p>
          <h1 className="text-sm leading-relaxed text-foreground">
            MESA VIRTUAL
          </h1>
          <p className="mt-4 text-[8px] leading-5 text-foreground/70">
            RPG de mesa online · 8-bit · isométrico · tempo real
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/dashboard" className="pixel-btn text-center">
            Entrar no Lobby
          </Link>
          <Link
            href="/login"
            className="pixel-btn pixel-btn-secondary text-center"
          >
            Login / Cadastro
          </Link>
        </div>

        <p className="text-[7px] leading-4 text-foreground/40 max-w-xs">
          Passo 2 ativo — autenticação e lobbies de campanha.
        </p>
      </main>
    </div>
  );
}
