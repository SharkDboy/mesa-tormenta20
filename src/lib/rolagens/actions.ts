"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/campanhas/actions";
import { rolarExpressao } from "@/lib/t20/dados";
import { enviarRolagemDiscord } from "@/lib/rolagens/discord";
import type { ExecutarRolagemInput, RolagemRegistro } from "@/lib/rolagens/types";
import type { Json } from "@/types/database";

export async function executarRolagem(
  input: ExecutarRolagemInput,
): Promise<ActionResult<RolagemRegistro>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada." };
  }

  const nome = input.nomePersonagem.trim() || "Anônimo";
  const teste = input.teste.trim() || "Rolagem";

  let resultado;
  try {
    resultado = rolarExpressao(input.expressao);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Expressão inválida.",
    };
  }

  const { data: campanha } = await supabase
    .from("campanhas")
    .select("discord_url")
    .eq("id", input.campanhaId)
    .maybeSingle();

  if (!campanha) {
    return { ok: false, error: "Campanha não encontrada." };
  }

  const { data: inserida, error } = await supabase
    .from("rolagens")
    .insert({
      campanha_id: input.campanhaId,
      usuario_id: user.id,
      ficha_id: input.fichaId ?? null,
      nome_personagem: nome,
      teste,
      expressao: resultado.expressao,
      resultados: resultado.resultados as unknown as Json,
      modificador: resultado.modificador,
      total: resultado.total,
      detalhes: resultado.detalhes,
    })
    .select("*")
    .single();

  if (error || !inserida) {
    return { ok: false, error: error?.message ?? "Erro ao registrar rolagem." };
  }

  if (campanha.discord_url) {
    const discord = await enviarRolagemDiscord(campanha.discord_url, {
      nomePersonagem: nome,
      teste,
      expressao: resultado.expressao,
      resultados: resultado.resultados,
      modificador: resultado.modificador,
      total: resultado.total,
      detalhes: resultado.detalhes,
    });

    if (!discord.ok) {
      // Rolagem salva mesmo se Discord falhar
      console.warn("[discord webhook]", discord.error);
    }
  }

  revalidatePath(`/campanha/${input.campanhaId}/mesa`);
  revalidatePath(`/campanha/${input.campanhaId}/ficha`);

  const registro: RolagemRegistro = {
    id: inserida.id,
    campanha_id: inserida.campanha_id,
    usuario_id: inserida.usuario_id,
    ficha_id: inserida.ficha_id,
    nome_personagem: inserida.nome_personagem,
    teste: inserida.teste,
    expressao: inserida.expressao,
    resultados: resultado.resultados,
    modificador: inserida.modificador,
    total: inserida.total,
    detalhes: inserida.detalhes,
    criado_em: inserida.criado_em,
  };

  return { ok: true, data: registro };
}
