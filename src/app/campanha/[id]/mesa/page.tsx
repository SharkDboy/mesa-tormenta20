import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { obterCampanhaDetalhe } from "@/lib/campanhas/queries";
import { obterFichaDoJogador } from "@/lib/fichas/queries";
import { listarUltimasRolagens } from "@/lib/rolagens/queries";
import { listarTokensCampanha } from "@/lib/board/queries";
import { MesaJogoClient } from "@/components/mesa/MesaJogoClient";

export default async function MesaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id: campanhaId } = await params;

  const detalhe = await obterCampanhaDetalhe(campanhaId);
  if (!detalhe) notFound();

  const [fichaJogador, historico, tokens] = await Promise.all([
    obterFichaDoJogador(campanhaId, user.id),
    listarUltimasRolagens(campanhaId, 10),
    listarTokensCampanha(campanhaId),
  ]);

  const { campanha } = detalhe;

  return (
    <MesaJogoClient
      campanhaId={campanhaId}
      campanhaNome={campanha.nome}
      configTabuleiro={{
        gridColunas: campanha.grid_colunas,
        gridLinhas: campanha.grid_linhas,
        tileLargura: campanha.tile_largura,
        tileAltura: campanha.tile_altura,
      }}
      tokensInicial={tokens}
      fichaJogador={fichaJogador}
      historicoInicial={historico}
      userId={user.id}
      ehMestre={detalhe.ehMestre}
    />
  );
}
