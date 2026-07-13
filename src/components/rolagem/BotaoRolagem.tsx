"use client";

import { formatarModificador } from "@/lib/t20/dados";

interface BotaoRolagemProps {
  rotulo: string;
  modificador: number;
  disabled?: boolean;
  onClick: () => void;
}

export function BotaoRolagem({
  rotulo,
  modificador,
  disabled,
  onClick,
}: BotaoRolagemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="pixel-border bg-surface-light hover:bg-surface text-left px-3 py-2 transition-colors disabled:opacity-50 group"
    >
      <span className="text-[7px] block group-hover:text-accent transition-colors">
        {rotulo}{" "}
        <span className="text-accent">({formatarModificador(modificador)})</span>
      </span>
      <span className="text-[5px] text-foreground/40">
        1d20 {formatarModificador(modificador)}
      </span>
    </button>
  );
}
