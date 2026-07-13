"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

export async function criarCampanha(
  nome: string,
  discordUrl?: string,
): Promise<ActionResult<{ id: string; codigo_convite: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const nomeLimpo = nome.trim();
  if (nomeLimpo.length < 2) {
    return { ok: false, error: "O nome da campanha deve ter ao menos 2 caracteres." };
  }

  const { data: campanha, error } = await supabase
    .from("campanhas")
    .insert({
      nome: nomeLimpo,
      mestre_id: user.id,
      discord_url: discordUrl?.trim() || null,
    })
    .select("id, codigo_convite")
    .single();

  if (error || !campanha) {
    return {
      ok: false,
      error: error?.message ?? "Não foi possível criar a campanha.",
    };
  }

  const { error: membroError } = await supabase.from("membros_campanha").insert({
    campanha_id: campanha.id,
    usuario_id: user.id,
    papel: "gm",
  });

  if (membroError) {
    return {
      ok: false,
      error: membroError.message,
    };
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    data: {
      id: campanha.id,
      codigo_convite: campanha.codigo_convite,
    },
  };
}

export async function entrarCampanha(
  codigo: string,
): Promise<ActionResult<{ campanhaId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada. Faça login novamente." };
  }

  const codigoLimpo = codigo.trim().toUpperCase();
  if (codigoLimpo.length !== 6) {
    return { ok: false, error: "O código de acesso deve ter 6 caracteres." };
  }

  const { data: campanha, error: buscaError } = await supabase
    .from("campanhas")
    .select("id, mestre_id, ativa")
    .eq("codigo_convite", codigoLimpo)
    .maybeSingle();

  if (buscaError || !campanha) {
    return { ok: false, error: "Código de acesso inválido." };
  }

  if (!campanha.ativa) {
    return { ok: false, error: "Esta campanha não está mais ativa." };
  }

  if (campanha.mestre_id === user.id) {
    return { ok: true, data: { campanhaId: campanha.id } };
  }

  const { data: existente } = await supabase
    .from("membros_campanha")
    .select("id")
    .eq("campanha_id", campanha.id)
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (existente) {
    return { ok: true, data: { campanhaId: campanha.id } };
  }

  const { error: insertError } = await supabase.from("membros_campanha").insert({
    campanha_id: campanha.id,
    usuario_id: user.id,
    papel: "jogador",
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, data: { campanhaId: campanha.id } };
}

export async function sairDaConta() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function atualizarDiscordUrl(
  campanhaId: string,
  discordUrl: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sessão expirada." };
  }

  const { error } = await supabase
    .from("campanhas")
    .update({ discord_url: discordUrl.trim() || null })
    .eq("id", campanhaId)
    .eq("mestre_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/campanha/${campanhaId}`);
  return { ok: true };
}
