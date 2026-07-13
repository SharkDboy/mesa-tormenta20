import { createClient } from "@/lib/supabase/server";
import type { TokenNoTabuleiro } from "./types";
import { mapFichaNoTabuleiro } from "./desenhar";

export async function listarTokensCampanha(
  campanhaId: string,
): Promise<TokenNoTabuleiro[]> {
  const supabase = await createClient();

  const { data: posicoes } = await supabase
    .from("posicoes_token")
    .select("id, ficha_id, grid_x, grid_y, visivel")
    .eq("campanha_id", campanhaId);

  if (!posicoes?.length) return [];

  const fichaIds = posicoes.map((p) => p.ficha_id);
  const { data: fichas } = await supabase
    .from("fichas_t20")
    .select(
      "id, nome, tipo, dono_id, pv_atual, pv_max, pm_atual, pm_max, sprite_config",
    )
    .in("id", fichaIds);

  const fichasPorId = new Map((fichas ?? []).map((f) => [f.id, f]));

  return posicoes.flatMap((pos) => {
    const fichaRow = fichasPorId.get(pos.ficha_id);
    if (!fichaRow) return [];
    return [
      {
        posicaoId: pos.id,
        fichaId: pos.ficha_id,
        gridX: pos.grid_x,
        gridY: pos.grid_y,
        visivel: pos.visivel,
        ficha: mapFichaNoTabuleiro(fichaRow),
      },
    ];
  });
}
