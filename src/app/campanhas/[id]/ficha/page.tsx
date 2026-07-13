import { redirect } from "next/navigation";

export default async function FichaLegacyRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/campanha/${id}/ficha`);
}
