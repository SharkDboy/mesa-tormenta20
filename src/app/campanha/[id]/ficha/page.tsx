import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { obterCampanhaDetalhe } from "@/lib/campanhas/queries";
import {
  listarFichasNpcMonstro,
  obterFichaDoJogador,
  obterFichaPorId,
  usuarioPodeEditarFicha,
} from "@/lib/fichas/queries";
import { FichaEditor } from "@/components/ficha/FichaEditor";
import { listarUltimasRolagens } from "@/lib/rolagens/queries";
import type { TipoFicha } from "@/types/t20";

function parseTipoNovo(valor: string | undefined): TipoFicha | null {
  if (valor === "npc" || valor === "monstro") return valor;
  return null;
}

export default async function FichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fichaId?: string; novo?: string }>;
}) {
  const user = await requireUser();
  const { id: campanhaId } = await params;
  const { fichaId, novo } = await searchParams;

  const detalhe = await obterCampanhaDetalhe(campanhaId);
  if (!detalhe) notFound();

  const npcsMonstros = detalhe.ehMestre
    ? await listarFichasNpcMonstro(campanhaId)
    : [];

  const historicoInicial = await listarUltimasRolagens(campanhaId, 10);

  if (fichaId) {
    const ficha = await obterFichaPorId(fichaId, campanhaId);
    if (!ficha) notFound();

    const podeEditar = await usuarioPodeEditarFicha(
      ficha,
      user.id,
      detalhe.ehMestre,
    );
    if (!podeEditar) notFound();

    return (
      <FichaEditor
        key={ficha.id}
        campanhaId={campanhaId}
        campanhaNome={detalhe.campanha.nome}
        fichaId={ficha.id}
        fichaInicial={ficha}
        tipoInicial={ficha.tipo}
        ehMestre={detalhe.ehMestre}
        npcsMonstros={npcsMonstros}
        historicoInicial={historicoInicial}
      />
    );
  }

  const tipoNovo = parseTipoNovo(novo);
  if (tipoNovo) {
    if (!detalhe.ehMestre) notFound();

    return (
      <FichaEditor
        key={`novo-${tipoNovo}`}
        campanhaId={campanhaId}
        campanhaNome={detalhe.campanha.nome}
        tipoInicial={tipoNovo}
        ehMestre={detalhe.ehMestre}
        npcsMonstros={npcsMonstros}
        historicoInicial={historicoInicial}
      />
    );
  }

  const fichaJogador = await obterFichaDoJogador(campanhaId, user.id);

  return (
    <FichaEditor
      key={fichaJogador?.id ?? "nova-pc"}
      campanhaId={campanhaId}
      campanhaNome={detalhe.campanha.nome}
      fichaId={fichaJogador?.id}
      fichaInicial={fichaJogador}
      tipoInicial="pc"
      ehMestre={detalhe.ehMestre}
      npcsMonstros={npcsMonstros}
      historicoInicial={historicoInicial}
    />
  );
}
