/**
 * Tipos gerados manualmente para o Passo 1.
 * Após conectar ao Supabase, regenere com:
 *   npx supabase gen types typescript --project-id SEU_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome_exibicao: string;
          avatar_url: string | null;
          criado_em: string;
        };
        Insert: {
          id: string;
          nome_exibicao: string;
          avatar_url?: string | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome_exibicao?: string;
          avatar_url?: string | null;
          criado_em?: string;
        };
        Relationships: [];
      };
      campanhas: {
        Row: {
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
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          codigo_convite?: string;
          mestre_id: string;
          grid_colunas?: number;
          grid_linhas?: number;
          tile_largura?: number;
          tile_altura?: number;
          notas_historia?: string;
          notas_progresso?: string;
          discord_url?: string | null;
          ativa?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          codigo_convite?: string;
          mestre_id?: string;
          grid_colunas?: number;
          grid_linhas?: number;
          tile_largura?: number;
          tile_altura?: number;
          notas_historia?: string;
          notas_progresso?: string;
          discord_url?: string | null;
          ativa?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      membros_campanha: {
        Row: {
          id: string;
          campanha_id: string;
          usuario_id: string;
          papel: "gm" | "jogador";
          entrou_em: string;
        };
        Insert: {
          id?: string;
          campanha_id: string;
          usuario_id: string;
          papel?: "gm" | "jogador";
          entrou_em?: string;
        };
        Update: {
          id?: string;
          campanha_id?: string;
          usuario_id?: string;
          papel?: "gm" | "jogador";
          entrou_em?: string;
        };
        Relationships: [];
      };
      fichas_t20: {
        Row: {
          id: string;
          campanha_id: string;
          dono_id: string | null;
          tipo: "pc" | "npc" | "monstro";
          nome: string;
          raca: string | null;
          classe: string | null;
          nivel: number;
          origem: string | null;
          divindade: string | null;
          biografia: string;
          inventario: string;
          for_mod: number;
          des_mod: number;
          con_mod: number;
          int_mod: number;
          sab_mod: number;
          car_mod: number;
          pv_atual: number;
          pv_max: number;
          pm_atual: number;
          pm_max: number;
          defesa: number;
          pericias: Json;
          sprite_config: Json;
          token_url: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          campanha_id: string;
          dono_id?: string | null;
          tipo?: "pc" | "npc" | "monstro";
          nome: string;
          raca?: string | null;
          classe?: string | null;
          nivel?: number;
          origem?: string | null;
          divindade?: string | null;
          biografia?: string;
          inventario?: string;
          for_mod?: number;
          des_mod?: number;
          con_mod?: number;
          int_mod?: number;
          sab_mod?: number;
          car_mod?: number;
          pv_atual?: number;
          pv_max?: number;
          pm_atual?: number;
          pm_max?: number;
          defesa?: number;
          pericias?: Json;
          sprite_config?: Json;
          token_url?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          campanha_id?: string;
          dono_id?: string | null;
          tipo?: "pc" | "npc" | "monstro";
          nome?: string;
          raca?: string | null;
          classe?: string | null;
          nivel?: number;
          origem?: string | null;
          divindade?: string | null;
          biografia?: string;
          inventario?: string;
          for_mod?: number;
          des_mod?: number;
          con_mod?: number;
          int_mod?: number;
          sab_mod?: number;
          car_mod?: number;
          pv_atual?: number;
          pv_max?: number;
          pm_atual?: number;
          pm_max?: number;
          defesa?: number;
          pericias?: Json;
          sprite_config?: Json;
          token_url?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      posicoes_token: {
        Row: {
          id: string;
          campanha_id: string;
          ficha_id: string;
          grid_x: number;
          grid_y: number;
          visivel: boolean;
          atualizado_por: string | null;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          campanha_id: string;
          ficha_id: string;
          grid_x?: number;
          grid_y?: number;
          visivel?: boolean;
          atualizado_por?: string | null;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          campanha_id?: string;
          ficha_id?: string;
          grid_x?: number;
          grid_y?: number;
          visivel?: boolean;
          atualizado_por?: string | null;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      encontros: {
        Row: {
          id: string;
          campanha_id: string;
          nome: string;
          rodada: number;
          turno_atual: number;
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          campanha_id: string;
          nome?: string;
          rodada?: number;
          turno_atual?: number;
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          campanha_id?: string;
          nome?: string;
          rodada?: number;
          turno_atual?: number;
          ativo?: boolean;
          criado_em?: string;
        };
        Relationships: [];
      };
      iniciativa: {
        Row: {
          id: string;
          encontro_id: string;
          ficha_id: string;
          valor: number;
          ordem: number;
          ja_agiu: boolean;
        };
        Insert: {
          id?: string;
          encontro_id: string;
          ficha_id: string;
          valor: number;
          ordem?: number;
          ja_agiu?: boolean;
        };
        Update: {
          id?: string;
          encontro_id?: string;
          ficha_id?: string;
          valor?: number;
          ordem?: number;
          ja_agiu?: boolean;
        };
        Relationships: [];
      };
      rolagens: {
        Row: {
          id: string;
          campanha_id: string;
          usuario_id: string;
          ficha_id: string | null;
          nome_personagem: string;
          teste: string;
          expressao: string;
          resultados: Json;
          modificador: number;
          total: number;
          detalhes: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          campanha_id: string;
          usuario_id: string;
          ficha_id?: string | null;
          nome_personagem: string;
          teste: string;
          expressao: string;
          resultados?: Json;
          modificador?: number;
          total: number;
          detalhes?: string;
          criado_em?: string;
        };
        Update: {
          id?: string;
          campanha_id?: string;
          usuario_id?: string;
          ficha_id?: string | null;
          nome_personagem?: string;
          teste?: string;
          expressao?: string;
          resultados?: Json;
          modificador?: number;
          total?: number;
          detalhes?: string;
          criado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      eh_membro_campanha: { Args: { p_campanha_id: string }; Returns: boolean };
      eh_mestre_campanha: { Args: { p_campanha_id: string }; Returns: boolean };
      gerar_codigo_convite: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      papel_campanha: "gm" | "jogador";
      tipo_ficha: "pc" | "npc" | "monstro";
    };
    CompositeTypes: Record<string, never>;
  };
};
