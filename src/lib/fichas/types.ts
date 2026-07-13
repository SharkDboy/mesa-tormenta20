import type { FichaT20, SpriteConfig, TipoFicha, PericiaT20 } from "@/types/t20";
import { SPRITE_CONFIG_PADRAO } from "@/types/t20";

export type AbaFicha = "atributos" | "registro" | "inventario";

export interface FichaFormData {
  tipo: TipoFicha;
  nome: string;
  raca: string;
  classe: string;
  nivel: number;
  origem: string;
  divindade: string;
  biografia: string;
  inventario: string;
  for_mod: number;
  des_mod: number;
  con_mod: number;
  int_mod: number;
  sab_mod: number;
  car_mod: number;
  pv_max: number;
  pv_atual: number;
  pm_max: number;
  pm_atual: number;
  defesa: number;
  sprite_config: SpriteConfig;
  pericias: Record<string, PericiaT20>;
}

export function fichaParaFormulario(ficha: FichaT20): FichaFormData {
  return {
    tipo: ficha.tipo,
    nome: ficha.nome,
    raca: ficha.raca ?? "",
    classe: ficha.classe ?? "",
    nivel: ficha.nivel,
    origem: ficha.origem ?? "",
    divindade: ficha.divindade ?? "",
    biografia: ficha.biografia ?? "",
    inventario: ficha.inventario ?? "",
    for_mod: ficha.for_mod,
    des_mod: ficha.des_mod,
    con_mod: ficha.con_mod,
    int_mod: ficha.int_mod,
    sab_mod: ficha.sab_mod,
    car_mod: ficha.car_mod,
    pv_max: ficha.pv_max,
    pv_atual: ficha.pv_atual,
    pm_max: ficha.pm_max,
    pm_atual: ficha.pm_atual,
    defesa: ficha.defesa,
    sprite_config: ficha.sprite_config,
    pericias: ficha.pericias ?? {},
  };
}

export function formularioPadrao(tipo: TipoFicha = "pc"): FichaFormData {
  return {
    tipo,
    nome: "",
    raca: "",
    classe: "",
    nivel: 1,
    origem: "",
    divindade: "",
    biografia: "",
    inventario: "",
    for_mod: 0,
    des_mod: 0,
    con_mod: 0,
    int_mod: 0,
    sab_mod: 0,
    car_mod: 0,
    pv_max: 10,
    pv_atual: 10,
    pm_max: 0,
    pm_atual: 0,
    defesa: 10,
    sprite_config: { ...SPRITE_CONFIG_PADRAO },
    pericias: {},
  };
}

export interface FichaResumo {
  id: string;
  nome: string;
  tipo: TipoFicha;
  nivel: number;
  dono_id: string | null;
}
