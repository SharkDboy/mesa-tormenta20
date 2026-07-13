import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { obterCampanhaDetalhe } from "@/lib/campanhas/queries";
import { CampanhaLobby } from "@/components/campanhas/CampanhaLobby";

export default async function CampanhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const detalhe = await obterCampanhaDetalhe(id);
  if (!detalhe) {
    notFound();
  }

  return <CampanhaLobby detalhe={detalhe} />;
}
