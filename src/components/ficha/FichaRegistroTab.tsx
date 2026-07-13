import type { FichaFormData } from "@/lib/fichas/types";
import type { TipoFicha } from "@/types/t20";

interface FichaRegistroTabProps {
  dados: FichaFormData;
  onChange: (dados: Partial<FichaFormData>) => void;
  podeAlterarTipo: boolean;
}

const TIPOS: { valor: TipoFicha; label: string }[] = [
  { valor: "pc", label: "Personagem" },
  { valor: "npc", label: "NPC" },
  { valor: "monstro", label: "Monstro" },
];

export function FichaRegistroTab({
  dados,
  onChange,
  podeAlterarTipo,
}: FichaRegistroTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {podeAlterarTipo && (
        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Tipo de ficha</span>
          <select
            value={dados.tipo}
            onChange={(e) =>
              onChange({ tipo: e.target.value as TipoFicha })
            }
            className="pixel-input"
          >
            {TIPOS.map(({ valor, label }) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-[7px] text-foreground/60">Nome do personagem</span>
        <input
          type="text"
          value={dados.nome}
          onChange={(e) => onChange({ nome: e.target.value })}
          className="pixel-input"
          placeholder="Nome do herói"
          required
          maxLength={80}
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Raça</span>
          <input
            type="text"
            value={dados.raca}
            onChange={(e) => onChange({ raca: e.target.value })}
            className="pixel-input"
            placeholder="Humano, Anão..."
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Classe</span>
          <input
            type="text"
            value={dados.classe}
            onChange={(e) => onChange({ classe: e.target.value })}
            className="pixel-input"
            placeholder="Guerreiro, Mago..."
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Origem</span>
          <input
            type="text"
            value={dados.origem}
            onChange={(e) => onChange({ origem: e.target.value })}
            className="pixel-input"
            placeholder="Soldado, Nobre..."
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Divindade</span>
          <input
            type="text"
            value={dados.divindade}
            onChange={(e) => onChange({ divindade: e.target.value })}
            className="pixel-input"
            placeholder="Khalmyr, Tanna-Toh..."
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[7px] text-foreground/60">Biografia / História</span>
        <textarea
          value={dados.biografia}
          onChange={(e) => onChange({ biografia: e.target.value })}
          className="pixel-input min-h-[120px] resize-y leading-5"
          placeholder="História do personagem, traços, objetivos..."
          rows={6}
        />
      </label>
    </div>
  );
}
