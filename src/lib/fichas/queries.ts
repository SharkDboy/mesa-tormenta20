import { createClient } from "@/lib/supabase/server";
import { parseSpriteConfig } from "@/lib/board/utils";
import type { FichaT20 } from "@/types/t20";
import type { FichaResumo } from "./types";

function mapRowFicha(row: Record<string, unknown>): FichaT20 {
  return {
    id: row.id as string,
    campanha_id: row.campanha_id as string,
    dono_id: (row.dono_id as string | null) ?? null,
    tipo: row.tipo as FichaT20["tipo"],
    nome: row.nome as string,
    raca: (row.raca as string | null) ?? null,
    classe: (row.classe as string | null) ?? null,
    nivel: row.nivel as number,
    origem: (row.origem as string | null) ?? null,
    divindade: (row.divindade as string | null) ?? null,
    biografia: (row.biografia as string | undefined) ?? "",
    inventario: (row.inventario as string | undefined) ?? "",
    for_mod: row.for_mod as number,
    des_mod: row.des_mod as number,
    con_mod: row.con_mod as number,
    int_mod: row.int_mod as number,
    sab_mod: row.sab_mod as number,
    car_mod: row.car_mod as number,
    pv_atual: row.pv_atual as number,
    pv_max: row.pv_max as number,
    pm_atual: row.pm_atual as number,
    pm_max: row.pm_max as number,
    defesa: row.defesa as number,
    pericias: (row.pericias as FichaT20["pericias"]) ?? {},
    sprite_config: parseSpriteConfig(row.sprite_config),
    token_url: (row.token_url as string | null) ?? null,
    criado_em: row.criado_em as string | undefined,
    atualizado_em: row.atualizado_em as string | undefined,
  };
}

export async function obterFichaDoJogador(
  campanhaId: string,
  usuarioId: string,
): Promise<FichaT20 | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("fichas_t20")
    .select("*")
    .eq("campanha_id", campanhaId)
    .eq("dono_id", usuarioId)
    .eq("tipo", "pc")
    .maybeSingle();

  return data ? mapRowFicha(data) : null;
}

export async function obterFichaPorId(
  fichaId: string,
  campanhaId: string,
): Promise<FichaT20 | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("fichas_t20")
    .select("*")
    .eq("id", fichaId)
    .eq("campanha_id", campanhaId)
    .maybeSingle();

  return data ? mapRowFicha(data) : null;
}

export async function listarFichasNpcMonstro(
  campanhaId: string,
): Promise<FichaResumo[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("fichas_t20")
    .select("id, nome, tipo, nivel, dono_id")
    .eq("campanha_id", campanhaId)
    .in("tipo", ["npc", "monstro"])
    .order("nome", { ascending: true });

  return (data ?? []) as FichaResumo[];
}

export async function usuarioPodeEditarFicha(
  ficha: FichaT20,
  usuarioId: string,
  ehMestre: boolean,
): Promise<boolean> {
  if (ehMestre) return true;
  return ficha.dono_id === usuarioId && ficha.tipo === "pc";
}
