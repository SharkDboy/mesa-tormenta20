"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/campanhas/actions";
import type { Database, Json } from "@/types/database";
import { validarFichaFormulario } from "@/lib/fichas/validacao";
import type { FichaFormData } from "@/lib/fichas/types";
import {
  obterFichaPorId,
  obterFichaDoJogador,
  usuarioPodeEditarFicha,
} from "@/lib/fichas/queries";
import { obterCampanhaDetalhe } from "@/lib/campanhas/queries";

export async function salvarFicha(
  campanhaId: string,
  dados: FichaFormData,
  fichaId?: string,
  tokenUrl?: string | null,
): Promise<ActionResult<{ fichaId: string }>> {
  const erroValidacao = validarFichaFormulario(dados);
  if (erroValidacao) {
    return { ok: false, error: erroValidacao };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const detalhe = await obterCampanhaDetalhe(campanhaId);
  if (!detalhe) {
    return { ok: false, error: "Campanha não encontrada ou sem permissão." };
  }

  const camposFicha = {
    nome: dados.nome.trim(),
    raca: dados.raca.trim() || null,
    classe: dados.classe.trim() || null,
    nivel: dados.nivel,
    origem: dados.origem.trim() || null,
    divindade: dados.divindade.trim() || null,
    biografia: dados.biografia.trim(),
    inventario: dados.inventario.trim(),
    for_mod: dados.for_mod,
    des_mod: dados.des_mod,
    con_mod: dados.con_mod,
    int_mod: dados.int_mod,
    sab_mod: dados.sab_mod,
    car_mod: dados.car_mod,
    pv_max: dados.pv_max,
    pv_atual: dados.pv_atual,
    pm_max: dados.pm_max,
    pm_atual: dados.pm_atual,
    defesa: dados.defesa,
    pericias: dados.pericias as unknown as Json,
    sprite_config: dados.sprite_config as unknown as Json,
    token_url: tokenUrl ?? null,
  };

  let fichaSalvaId = fichaId;

  if (fichaId) {
    const fichaExistente = await obterFichaPorId(fichaId, campanhaId);
    if (!fichaExistente) {
      return { ok: false, error: "Ficha não encontrada." };
    }

    const podeEditar = await usuarioPodeEditarFicha(
      fichaExistente,
      user.id,
      detalhe.ehMestre,
    );
    if (!podeEditar) {
      return { ok: false, error: "Você não tem permissão para editar esta ficha." };
    }

    const updatePayload: Database["public"]["Tables"]["fichas_t20"]["Update"] = {
      ...camposFicha,
      tipo: detalhe.ehMestre ? dados.tipo : fichaExistente.tipo,
    };

    const { data: fichaAtualizada, error } = await supabase
      .from("fichas_t20")
      .update(updatePayload)
      .eq("id", fichaId)
      .eq("campanha_id", campanhaId)
      .select("id")
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!fichaAtualizada) {
      return {
        ok: false,
        error:
          "Não foi possível salvar a ficha. Verifique se você tem permissão ou rode o script de políticas RLS no Supabase.",
      };
    }
  } else {
    if (dados.tipo === "pc") {
      const fichaJogador = await obterFichaDoJogador(campanhaId, user.id);
      if (fichaJogador) {
        return {
          ok: false,
          error: "Você já possui um personagem nesta campanha.",
        };
      }
    } else if (!detalhe.ehMestre) {
      return {
        ok: false,
        error: "Apenas o mestre pode criar NPCs e monstros.",
      };
    }

    const insertData: Database["public"]["Tables"]["fichas_t20"]["Insert"] = {
      campanha_id: campanhaId,
      tipo: dados.tipo,
      ...camposFicha,
      dono_id: dados.tipo === "pc" ? user.id : null,
    };

    const { data: novaFicha, error } = await supabase
      .from("fichas_t20")
      .insert(insertData)
      .select("id")
      .single();

    if (error || !novaFicha) {
      return { ok: false, error: error?.message ?? "Erro ao criar ficha." };
    }

    fichaSalvaId = novaFicha.id;
  }

  if (!fichaSalvaId) {
    return { ok: false, error: "Erro interno ao salvar ficha." };
  }

  const { data: posicaoExistente } = await supabase
    .from("posicoes_token")
    .select("id")
    .eq("ficha_id", fichaSalvaId)
    .maybeSingle();

  if (!posicaoExistente) {
    const { error: posicaoError } = await supabase.from("posicoes_token").insert({
      campanha_id: campanhaId,
      ficha_id: fichaSalvaId,
      grid_x: 0,
      grid_y: 0,
      visivel: true,
      atualizado_por: user.id,
    });

    if (posicaoError) {
      return { ok: false, error: posicaoError.message };
    }
  }

  revalidatePath(`/campanha/${campanhaId}/ficha`);
  revalidatePath(`/campanha/${campanhaId}`);

  return { ok: true, data: { fichaId: fichaSalvaId } };
}
