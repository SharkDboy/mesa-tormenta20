import Link from "next/link";
import type { CampanhaComPapel } from "@/lib/campanhas/types";

interface CampanhaListProps {
  campanhas: CampanhaComPapel[];
  titulo: string;
  vazio?: string;
}

export function CampanhaList({ campanhas, titulo, vazio }: CampanhaListProps) {
  return (
    <section>
      <h2 className="text-[9px] mb-3 text-foreground/80">{titulo}</h2>

      {campanhas.length === 0 ? (
        <p className="text-[7px] text-foreground/40 leading-4">
          {vazio ?? "Nenhuma campanha encontrada."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {campanhas.map(({ campanha, ehMestre }) => (
            <li key={campanha.id}>
              <Link
                href={`/campanha/${campanha.id}`}
                className="pixel-border bg-surface block p-4 hover:bg-surface-light transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[8px]">{campanha.nome}</span>
                  {ehMestre && (
                    <span className="text-[6px] text-accent shrink-0">GM</span>
                  )}
                </div>
                {ehMestre && (
                  <p className="text-[6px] text-foreground/40 mt-2">
                    Código:{" "}
                    <span className="text-accent tracking-wider">
                      {campanha.codigo_convite}
                    </span>
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
