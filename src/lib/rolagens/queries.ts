import { createClient } from "@/lib/supabase/server";
import type { RolagemRegistro } from "./types";

function mapRolagem(row: Record<string, unknown>): RolagemRegistro {
  const resultados = row.resultados;
  return {
    id: row.id as string,
    campanha_id: row.campanha_id as string,
    usuario_id: row.usuario_id as string,
    ficha_id: (row.ficha_id as string | null) ?? null,
    nome_personagem: row.nome_personagem as string,
    teste: row.teste as string,
    expressao: row.expressao as string,
    resultados: Array.isArray(resultados)
      ? resultados.filter((v): v is number => typeof v === "number")
      : [],
    modificador: row.modificador as number,
    total: row.total as number,
    detalhes: row.detalhes as string,
    criado_em: row.criado_em as string,
  };
}

export async function listarUltimasRolagens(
  campanhaId: string,
  limite = 10,
): Promise<RolagemRegistro[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("rolagens")
    .select("*")
    .eq("campanha_id", campanhaId)
    .order("criado_em", { ascending: false })
    .limit(limite);

  return (data ?? []).map(mapRolagem);
}
