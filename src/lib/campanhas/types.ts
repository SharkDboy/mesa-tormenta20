import type { Database } from "@/types/database";

export type CampanhaRow = Database["public"]["Tables"]["campanhas"]["Row"];
export type PapelCampanha = Database["public"]["Enums"]["papel_campanha"];

export interface CampanhaComPapel {
  campanha: CampanhaRow;
  papel: PapelCampanha;
  ehMestre: boolean;
}

export interface MembroComPerfil {
  id: string;
  papel: PapelCampanha;
  entrou_em: string;
  usuario: {
    id: string;
    nome_exibicao: string;
    avatar_url: string | null;
  };
}

export interface CampanhaDetalhe {
  campanha: CampanhaRow;
  papel: PapelCampanha;
  ehMestre: boolean;
  membros: MembroComPerfil[];
}
