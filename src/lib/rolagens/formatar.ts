import type { RolagemRegistro } from "@/lib/rolagens/types";
import { formatarModificador } from "@/lib/t20/dados";

export function formatarLinhaRolagem(r: RolagemRegistro): string {
  const dado =
    r.resultados.length === 1
      ? `[${r.resultados[0]}]`
      : `[${r.resultados.join(", ")}]`;
  const mod =
    r.modificador !== 0 ? ` ${formatarModificador(r.modificador)}` : "";
  return `${dado}${mod} = ${r.total}`;
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
