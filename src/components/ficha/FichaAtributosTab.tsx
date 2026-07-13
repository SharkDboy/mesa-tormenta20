import { ATRIBUTOS_T20, formatarModificador } from "@/lib/t20/atributos";
import { bonusTreinamento } from "@/lib/t20/treinamento";
import type { FichaFormData } from "@/lib/fichas/types";
import { BotaoRolagem } from "@/components/rolagem/BotaoRolagem";
import {
  calcularModificadorPericia,
  listarPericiasOrdenadas,
  rotuloPericia,
} from "@/lib/t20/rolagem-ficha";

interface FichaAtributosTabProps {
  dados: FichaFormData;
  onChange: (dados: Partial<FichaFormData>) => void;
  podeRolar: boolean;
  rolagemCarregando?: boolean;
  onRolar: (teste: string, expressao: string) => void;
}

function CampoNumero({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[7px] text-foreground/60">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pixel-input"
      />
    </label>
  );
}

export function FichaAtributosTab({
  dados,
  onChange,
  podeRolar,
  rolagemCarregando,
  onRolar,
}: FichaAtributosTabProps) {
  const treino = bonusTreinamento(dados.nivel);
  const periciasLista = listarPericiasOrdenadas();

  function rolarAtributo(label: string, mod: number) {
    const expr = mod === 0 ? "1d20" : `1d20${mod > 0 ? `+${mod}` : mod}`;
    onRolar(`${label} (${formatarModificador(mod)})`, expr);
  }

  function rolarPericia(nome: string) {
    const mod = calcularModificadorPericia(
      nome,
      dados,
      dados.nivel,
      dados.pericias,
    );
    if (!mod) return;
    const expr =
      mod.total === 0
        ? "1d20"
        : `1d20${mod.total > 0 ? `+${mod.total}` : mod.total}`;
    onRolar(
      `${rotuloPericia(nome)} (${formatarModificador(mod.total)})`,
      expr,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-[8px] mb-3 text-foreground/80">
          ATRIBUTOS (MODIFICADORES)
        </h3>
        <p className="text-[6px] text-foreground/40 mb-4 leading-4">
          Em T20 o valor já é o modificador. Bônus de treino: +{treino}.
          {podeRolar && " Clique no botão de rolagem ou edite o valor."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ATRIBUTOS_T20.map(({ col, label }) => (
            <div key={col} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[7px] text-foreground/60">{label}</span>
              </div>
              <input
                type="number"
                value={dados[col]}
                min={-5}
                max={20}
                onChange={(e) =>
                  onChange({
                    [col]: Number(e.target.value),
                  } as Partial<FichaFormData>)
                }
                className="pixel-input text-center"
              />
              {podeRolar ? (
                <BotaoRolagem
                  rotulo={label}
                  modificador={dados[col]}
                  disabled={rolagemCarregando}
                  onClick={() => rolarAtributo(label, dados[col])}
                />
              ) : (
                <span className="text-[6px] text-accent text-center">
                  {formatarModificador(dados[col])}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[8px] mb-3 text-foreground/80">PERÍCIAS T20</h3>
        <p className="text-[6px] text-foreground/40 mb-3 leading-4">
          Teste = d20 + atributo + treino (se treinada) + outros bônus.
        </p>
        {podeRolar ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {periciasLista.map((nome) => {
              const mod = calcularModificadorPericia(
                nome,
                dados,
                dados.nivel,
                dados.pericias,
              );
              if (!mod) return null;
              return (
                <BotaoRolagem
                  key={nome}
                  rotulo={rotuloPericia(nome)}
                  modificador={mod.total}
                  disabled={rolagemCarregando}
                  onClick={() => rolarPericia(nome)}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-[6px] text-foreground/40">
            Salve a ficha para habilitar rolagens vinculadas.
          </p>
        )}
      </section>

      <section>
        <h3 className="text-[8px] mb-3 text-foreground/80">RECURSOS</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <CampoNumero
            label="PV Máximo"
            value={dados.pv_max}
            min={0}
            onChange={(v) => onChange({ pv_max: v })}
          />
          <CampoNumero
            label="PV Atual"
            value={dados.pv_atual}
            min={0}
            max={dados.pv_max}
            onChange={(v) => onChange({ pv_atual: v })}
          />
          <CampoNumero
            label="PM Máximo"
            value={dados.pm_max}
            min={0}
            onChange={(v) => onChange({ pm_max: v })}
          />
          <CampoNumero
            label="PM Atual"
            value={dados.pm_atual}
            min={0}
            max={dados.pm_max}
            onChange={(v) => onChange({ pm_atual: v })}
          />
          <CampoNumero
            label="Defesa"
            value={dados.defesa}
            min={0}
            onChange={(v) => onChange({ defesa: v })}
          />
          <CampoNumero
            label="Nível"
            value={dados.nivel}
            min={1}
            max={20}
            onChange={(v) => onChange({ nivel: v })}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 h-3 bg-background border-2 border-border relative overflow-hidden">
            <div
              className="h-full bg-hp transition-all"
              style={{
                width: `${dados.pv_max > 0 ? (dados.pv_atual / dados.pv_max) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex-1 h-3 bg-background border-2 border-border relative overflow-hidden">
            <div
              className="h-full bg-mp transition-all"
              style={{
                width: `${dados.pm_max > 0 ? (dados.pm_atual / dados.pm_max) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
