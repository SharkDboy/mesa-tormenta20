export type PapelCampanha = "gm" | "jogador";
export type TipoFicha = "pc" | "npc" | "monstro";

export type AtributoT20 = "for" | "des" | "con" | "int" | "sab" | "car";

export interface AtributosT20 {
  for_mod: number;
  des_mod: number;
  con_mod: number;
  int_mod: number;
  sab_mod: number;
  car_mod: number;
}

export interface PericiaT20 {
  treinada: boolean;
  outros: number;
}

export interface SpriteConfig {
  pele: string;
  cabelo: string;
  roupa: string;
  estiloCabelo: "curto" | "longo" | "careca";
}

export const SPRITE_CONFIG_PADRAO: SpriteConfig = {
  pele: "#f4c4a0",
  cabelo: "#4a3728",
  roupa: "#3366cc",
  estiloCabelo: "curto",
};

export interface DadosRolagem {
  expressao: string;
  resultados: number[];
  total: number;
  detalhes: string;
}

export interface FichaT20 extends AtributosT20 {
  id: string;
  campanha_id: string;
  dono_id: string | null;
  tipo: TipoFicha;
  nome: string;
  raca: string | null;
  classe: string | null;
  nivel: number;
  origem: string | null;
  divindade: string | null;
  biografia?: string;
  inventario?: string;
  pv_atual: number;
  pv_max: number;
  pm_atual: number;
  pm_max: number;
  defesa: number;
  pericias: Record<string, PericiaT20>;
  sprite_config: SpriteConfig;
  token_url: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Campanha {
  id: string;
  nome: string;
  descricao: string | null;
  codigo_convite: string;
  mestre_id: string;
  grid_colunas: number;
  grid_linhas: number;
  tile_largura: number;
  tile_altura: number;
  notas_historia: string;
  notas_progresso: string;
  discord_url: string | null;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface PosicaoToken {
  id: string;
  campanha_id: string;
  ficha_id: string;
  grid_x: number;
  grid_y: number;
  visivel: boolean;
  atualizado_por: string | null;
  atualizado_em: string;
}
