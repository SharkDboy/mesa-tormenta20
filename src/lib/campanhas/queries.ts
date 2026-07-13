import { createClient } from "@/lib/supabase/server";
import type { CampanhaComPapel, CampanhaDetalhe } from "./types";

export async function listarCampanhasDoUsuario(): Promise<CampanhaComPapel[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: comoMestre } = await supabase
    .from("campanhas")
    .select("*")
    .eq("mestre_id", user.id)
    .order("criado_em", { ascending: false });

  const { data: membros } = await supabase
    .from("membros_campanha")
    .select("campanha_id, papel")
    .eq("usuario_id", user.id);

  const idsComoJogador = (membros ?? [])
    .map((m) => m.campanha_id)
    .filter((id) => !(comoMestre ?? []).some((c) => c.id === id));

  let campanhasComoJogador: NonNullable<typeof comoMestre> = [];

  if (idsComoJogador.length > 0) {
    const { data } = await supabase
      .from("campanhas")
      .select("*")
      .in("id", idsComoJogador);
    campanhasComoJogador = data ?? [];
  }

  const papelPorCampanha = new Map(
    (membros ?? []).map((m) => [m.campanha_id, m.papel]),
  );

  const mapa = new Map<string, CampanhaComPapel>();

  for (const campanha of comoMestre ?? []) {
    mapa.set(campanha.id, {
      campanha,
      papel: "gm",
      ehMestre: true,
    });
  }

  for (const campanha of campanhasComoJogador) {
    mapa.set(campanha.id, {
      campanha,
      papel: papelPorCampanha.get(campanha.id) ?? "jogador",
      ehMestre: false,
    });
  }

  return Array.from(mapa.values()).sort(
    (a, b) =>
      new Date(b.campanha.criado_em).getTime() -
      new Date(a.campanha.criado_em).getTime(),
  );
}

export async function listarCampanhasComoMestre() {
  const todas = await listarCampanhasDoUsuario();
  return todas.filter((item) => item.ehMestre);
}

export async function obterCampanhaDetalhe(
  campanhaId: string,
): Promise<CampanhaDetalhe | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: campanha } = await supabase
    .from("campanhas")
    .select("*")
    .eq("id", campanhaId)
    .maybeSingle();

  if (!campanha) return null;

  const ehMestre = campanha.mestre_id === user.id;

  const { data: membroAtual } = await supabase
    .from("membros_campanha")
    .select("papel")
    .eq("campanha_id", campanhaId)
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!ehMestre && !membroAtual) return null;

  const { data: membrosRaw } = await supabase
    .from("membros_campanha")
    .select("id, papel, entrou_em, usuario_id")
    .eq("campanha_id", campanhaId)
    .order("entrou_em", { ascending: true });

  const usuarioIds = [...new Set((membrosRaw ?? []).map((m) => m.usuario_id))];

  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, nome_exibicao, avatar_url")
    .in("id", usuarioIds);

  const usuariosPorId = new Map((usuarios ?? []).map((u) => [u.id, u]));

  const membros = (membrosRaw ?? []).flatMap((m) => {
    const usuario = usuariosPorId.get(m.usuario_id);
    if (!usuario) return [];
    return [
      {
        id: m.id,
        papel: m.papel,
        entrou_em: m.entrou_em,
        usuario,
      },
    ];
  });

  return {
    campanha,
    papel: ehMestre ? "gm" : (membroAtual?.papel ?? "jogador"),
    ehMestre,
    membros,
  };
}
