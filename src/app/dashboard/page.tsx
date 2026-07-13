import { requireUser } from "@/lib/auth/session";
import { listarCampanhasDoUsuario } from "@/lib/campanhas/queries";
import { DashboardClient } from "@/components/campanhas/DashboardClient";

export default async function DashboardPage() {
  await requireUser();

  const campanhas = await listarCampanhasDoUsuario();
  const campanhasComoMestre = campanhas.filter((c) => c.ehMestre);
  const campanhasComoJogador = campanhas.filter((c) => !c.ehMestre);

  return (
    <DashboardClient
      campanhasComoMestre={campanhasComoMestre}
      campanhasComoJogador={campanhasComoJogador}
    />
  );
}
