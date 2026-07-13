"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { sairDaConta } from "@/lib/campanhas/actions";

export function AppHeader() {
  const { user } = useAuth();

  function handleSair() {
    void sairDaConta();
  }

  return (
    <header className="border-b-4 border-border bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <Link href="/dashboard" className="text-[8px] text-accent">
          MESA T20
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-[7px] text-foreground/50 truncate max-w-[140px]">
              {user.email}
            </span>
          )}
          <button
            type="button"
            onClick={handleSair}
            className="text-[7px] text-foreground/60 hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
