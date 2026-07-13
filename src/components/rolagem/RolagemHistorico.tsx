"use client";

import type { RolagemRegistro } from "@/lib/rolagens/types";
import { formatarHora, formatarLinhaRolagem } from "@/lib/rolagens/formatar";

interface RolagemHistoricoProps {
  historico: RolagemRegistro[];
  compacto?: boolean;
}

export function RolagemHistorico({
  historico,
  compacto = false,
}: RolagemHistoricoProps) {
  if (historico.length === 0) {
    return (
      <p className="text-[6px] text-foreground/40 leading-4">
        Nenhuma rolagem ainda nesta sessão.
      </p>
    );
  }

  return (
    <ul className={`flex flex-col gap-2 ${compacto ? "" : "max-h-[320px] overflow-y-auto pr-1"}`}>
      {historico.map((r) => (
        <li
          key={r.id}
          className="border-l-2 border-accent/50 pl-2 py-1 bg-background/30"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[6px] text-accent truncate">
              {r.nome_personagem}
            </span>
            <span className="text-[5px] text-foreground/30 shrink-0">
              {formatarHora(r.criado_em)}
            </span>
          </div>
          <p className="text-[6px] text-foreground/60">{r.teste}</p>
          <p className="text-[7px] text-foreground mt-0.5">
            {formatarLinhaRolagem(r)}{" "}
            <span className="text-accent font-bold">→ {r.total}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
