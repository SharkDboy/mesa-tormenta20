import type { SpriteConfig } from "@/types/t20";
import { corDaCamada, obterMapaSprite } from "@/lib/sprite/pixel-avatar";

interface SpritePreviewProps {
  config: SpriteConfig;
  escala?: number;
  className?: string;
}

export function SpritePreview({
  config,
  escala = 4,
  className = "",
}: SpritePreviewProps) {
  const mapa = obterMapaSprite(config);
  const colunas = mapa[0]?.length ?? 0;
  const linhas = mapa.length;

  const chaveSprite = `${config.estiloCabelo}-${config.pele}-${config.cabelo}-${config.roupa}`;

  return (
    <div
      key={chaveSprite}
      className={`inline-grid bg-background/50 p-2 pixel-border ${className}`}
      style={{
        gridTemplateColumns: `repeat(${colunas}, ${escala}px)`,
        gridTemplateRows: `repeat(${linhas}, ${escala}px)`,
        imageRendering: "pixelated",
      }}
      aria-label="Pré-visualização do avatar 8-bit"
    >
      {mapa.flatMap((linha, y) =>
        linha.map((pixel, x) => {
          const cor = corDaCamada(pixel, config);
          return (
            <div
              key={`${x}-${y}`}
              style={{
                width: escala,
                height: escala,
                backgroundColor: cor ?? "transparent",
              }}
            />
          );
        }),
      )}
    </div>
  );
}
