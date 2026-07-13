import type { SpriteConfig } from "@/types/t20";
import { SpritePreview } from "./SpritePreview";

interface SpriteCustomizerProps {
  config: SpriteConfig;
  onChange: (config: SpriteConfig) => void;
}

const ESTILOS_CABELO: { valor: SpriteConfig["estiloCabelo"]; label: string }[] =
  [
    { valor: "curto", label: "Curto" },
    { valor: "longo", label: "Longo" },
    { valor: "careca", label: "Careca" },
  ];

export function SpriteCustomizer({ config, onChange }: SpriteCustomizerProps) {
  function atualizar(parcial: Partial<SpriteConfig>) {
    onChange({ ...config, ...parcial });
  }

  return (
    <div className="pixel-border bg-surface-light p-4 flex flex-col gap-4">
      <h3 className="text-[8px] text-accent">AVATAR 8-BIT</h3>

      <div className="flex justify-center">
        <SpritePreview config={config} escala={5} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Cor da pele</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.pele}
              onChange={(e) => atualizar({ pele: e.target.value })}
              className="h-8 w-10 cursor-pointer border-2 border-border bg-transparent"
              aria-label="Cor da pele"
            />
            <span className="text-[6px] text-foreground/40">{config.pele}</span>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[7px] text-foreground/60">Cor do cabelo</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.cabelo}
              onChange={(e) => atualizar({ cabelo: e.target.value })}
              className="h-8 w-10 cursor-pointer border-2 border-border bg-transparent"
              aria-label="Cor do cabelo"
            />
            <span className="text-[6px] text-foreground/40">{config.cabelo}</span>
          </div>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[7px] text-foreground/60">Cor da roupa</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.roupa}
              onChange={(e) => atualizar({ roupa: e.target.value })}
              className="h-8 w-10 cursor-pointer border-2 border-border bg-transparent"
              aria-label="Cor da roupa"
            />
            <span className="text-[6px] text-foreground/40">{config.roupa}</span>
          </div>
        </label>
      </div>

      <div>
        <span className="text-[7px] text-foreground/60 block mb-2">
          Estilo do cabelo
        </span>
        <div className="flex flex-wrap gap-2">
          {ESTILOS_CABELO.map(({ valor, label }) => (
            <button
              key={valor}
              type="button"
              onClick={() => atualizar({ estiloCabelo: valor })}
              className={`text-[7px] px-3 py-2 border-2 ${
                config.estiloCabelo === valor
                  ? "border-accent text-accent bg-surface"
                  : "border-border text-foreground/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
