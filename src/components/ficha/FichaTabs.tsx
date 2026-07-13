import type { AbaFicha } from "@/lib/fichas/types";

const ABAS: { id: AbaFicha; label: string }[] = [
  { id: "atributos", label: "Atributos" },
  { id: "registro", label: "Registro" },
  { id: "inventario", label: "Inventário" },
];

interface FichaTabsProps {
  abaAtiva: AbaFicha;
  onChange: (aba: AbaFicha) => void;
}

export function FichaTabs({ abaAtiva, onChange }: FichaTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b-2 border-border pb-3">
      {ABAS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`text-[7px] px-3 py-2 border-2 transition-colors ${
            abaAtiva === id
              ? "border-accent text-accent bg-surface-light"
              : "border-border text-foreground/50 hover:text-foreground/80"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
