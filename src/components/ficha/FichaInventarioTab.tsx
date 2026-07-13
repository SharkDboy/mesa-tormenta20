import type { FichaFormData } from "@/lib/fichas/types";

interface FichaInventarioTabProps {
  dados: FichaFormData;
  onChange: (dados: Partial<FichaFormData>) => void;
}

export function FichaInventarioTab({ dados, onChange }: FichaInventarioTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[7px] text-foreground/50 leading-4">
        Liste equipamentos, itens, tesouros e anotações de carga. Suporte a
        mecânicas detalhadas de inventário virá em versões futuras.
      </p>
      <label className="flex flex-col gap-1 flex-1">
        <span className="text-[7px] text-foreground/60">Inventário</span>
        <textarea
          value={dados.inventario}
          onChange={(e) => onChange({ inventario: e.target.value })}
          className="pixel-input min-h-[240px] resize-y leading-5 font-mono"
          placeholder={`• Espada longa (+1)\n• Armadura de couro\n• Poção de cura x2\n• 15 moedas de ouro`}
          rows={12}
        />
      </label>
    </div>
  );
}
