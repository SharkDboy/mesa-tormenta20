export interface RolagemRegistro {
  id: string;
  campanha_id: string;
  usuario_id: string;
  ficha_id: string | null;
  nome_personagem: string;
  teste: string;
  expressao: string;
  resultados: number[];
  modificador: number;
  total: number;
  detalhes: string;
  criado_em: string;
}

export interface ExecutarRolagemInput {
  campanhaId: string;
  fichaId?: string | null;
  nomePersonagem: string;
  teste: string;
  expressao: string;
}

export interface DiscordEmbedRolagem {
  nomePersonagem: string;
  teste: string;
  expressao: string;
  resultados: number[];
  modificador: number;
  total: number;
  detalhes: string;
}
