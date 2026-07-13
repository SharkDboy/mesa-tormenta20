"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/campanhas/actions";
import { obterCampanhaDetalhe } from "@/lib/campanhas/queries";
import type { Json } from "@/types/database";
import { SPRITE_CONFIG_PADRAO } from "@/types/t20";

export async function atualizarPosicaoToken(
  campanhaId: string,
  posicaoId: string,
  gridX: number,
  gridY: number,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Sessão expirada." };

  const detalhe = await obterCampanhaDetalhe(campanhaId);
  if (!detalhe) return { ok: false, error: "Sem permissão." };

  const { data: posicao } = await supabase
    .from("posicoes_token")
    .select("id, ficha_id, campanha_id")
    .eq("id", posicaoId)
    .eq("campanha_id", campanhaId)
    .maybeSingle();

  if (!posicao) return { ok: false, error: "Token não encontrado." };

  if (!detalhe.ehMestre) {
    const { data: ficha } = await supabase
      .from("fichas_t20")
      .select("dono_id")
      .eq("id", posicao.ficha_id)
      .maybeSingle();

    if (ficha?.dono_id !== user.id) {
      return { ok: false, error: "Você só pode mover seu próprio token." };
    }
  }

  const { data: campanha } = await supabase
    .from("campanhas")
    .select("grid_colunas, grid_linhas")
    .eq("id", campanhaId)
    .single();

  if (!campanha) return { ok: false, error: "Campanha não encontrada." };

  const gx = Math.max(0, Math.min(campanha.grid_colunas - 1, gridX));
  const gy = Math.max(0, Math.min(campanha.grid_linhas - 1, gridY));

  const { error } = await supabase
    .from("posicoes_token")
    .update({
      grid_x: gx,
      grid_y: gy,
      atualizado_por: user.id,
    })
    .eq("id", posicaoId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campanha/${campanhaId}/mesa`);
  return { ok: true };
}

export async function adicionarMonstroNoMapa(
  campanhaId: string,
): Promise<ActionResult<{ fichaId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Sessão expirada." };

  const detalhe = await obterCampanhaDetalhe(campanhaId);
  if (!detalhe?.ehMestre) {
    return { ok: false, error: "Apenas o mestre pode adicionar monstros." };
  }

  const { data: campanha } = await supabase
    .from("campanhas")
    .select("grid_colunas, grid_linhas")
    .eq("id", campanhaId)
    .single();

  if (!campanha) return { ok: false, error: "Campanha não encontrada." };

  const { count } = await supabase
    .from("fichas_t20")
    .select("id", { count: "exact", head: true })
    .eq("campanha_id", campanhaId)
    .eq("tipo", "monstro");

  const numero = (count ?? 0) + 1;

  const { data: ficha, error: fichaError } = await supabase
    .from("fichas_t20")
    .insert({
      campanha_id: campanhaId,
      dono_id: null,
      tipo: "monstro",
      nome: `Monstro ${numero}`,
      nivel: 1,
      biografia: "",
      inventario: "",
      pv_max: 20,
      pv_atual: 20,
      pm_max: 0,
      pm_atual: 0,
      defesa: 12,
      pericias: {} as unknown as Json,
      sprite_config: {
        ...SPRITE_CONFIG_PADRAO,
        roupa: "#8b0000",
        cabelo: "#2c1810",
      } as unknown as Json,
    })
    .select("id")
    .single();

  if (fichaError || !ficha) {
    return { ok: false, error: fichaError?.message ?? "Erro ao criar monstro." };
  }

  const { data: ocupadas } = await supabase
    .from("posicoes_token")
    .select("grid_x, grid_y")
    .eq("campanha_id", campanhaId);

  const ocupado = new Set((ocupadas ?? []).map((o) => `${o.grid_x},${o.grid_y}`));
  let spawnX = 1;
  let spawnY = 1;
  let encontrou = false;

  for (let y = 0; y < campanha.grid_linhas && !encontrou; y++) {
    for (let x = 0; x < campanha.grid_colunas && !encontrou; x++) {
      if (!ocupado.has(`${x},${y}`)) {
        spawnX = x;
        spawnY = y;
        encontrou = true;
      }
    }
  }

  const { error: posError } = await supabase.from("posicoes_token").insert({
    campanha_id: campanhaId,
    ficha_id: ficha.id,
    grid_x: spawnX,
    grid_y: spawnY,
    visivel: true,
    atualizado_por: user.id,
  });

  if (posError) {
    await supabase.from("fichas_t20").delete().eq("id", ficha.id);
    return { ok: false, error: posError.message };
  }

  revalidatePath(`/campanha/${campanhaId}/mesa`);
  return { ok: true, data: { fichaId: ficha.id } };
}

export async function limparMonstrosDerrotados(
  campanhaId: string,
): Promise<ActionResult<{ removidos: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Sessão expirada." };

  const detalhe = await obterCampanhaDetalhe(campanhaId);
  if (!detalhe?.ehMestre) {
    return { ok: false, error: "Apenas o mestre pode limpar monstros." };
  }

  const { data: derrotados } = await supabase
    .from("fichas_t20")
    .select("id")
    .eq("campanha_id", campanhaId)
    .eq("tipo", "monstro")
    .lte("pv_atual", 0);

  const ids = (derrotados ?? []).map((d) => d.id);
  if (ids.length === 0) {
    return { ok: true, data: { removidos: 0 } };
  }

  const { error } = await supabase.from("fichas_t20").delete().in("id", ids);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campanha/${campanhaId}/mesa`);
  return { ok: true, data: { removidos: ids.length } };
}
