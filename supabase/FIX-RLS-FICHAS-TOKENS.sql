-- =============================================================================
-- T20 VTT — Correção de RLS e schema para fichas + tokens do tabuleiro
-- Cole este arquivo inteiro no SQL Editor do Supabase → Run
-- =============================================================================
-- Corrige:
--   1. Jogadores não conseguem ATUALIZAR fichas (política sem WITH CHECK)
--   2. Mestre não consegue criar monstros/NPCs (INSERT com dono_id NULL)
--   3. Colunas faltantes em fichas_t20 (biografia, inventario, etc.)
--
-- NOTA: A tabela de tokens no tabuleiro é `posicoes_token` (não tokens_tabuleiro).
--       Monstros sempre têm uma linha em fichas_t20 com dono_id NULL.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Garantir colunas nullable corretas
-- ---------------------------------------------------------------------------
-- dono_id já é opcional (monstros/NPCs não têm dono)
alter table public.fichas_t20
  alter column dono_id drop not null;

-- atualizado_por em posicoes_token também é opcional
alter table public.posicoes_token
  alter column atualizado_por drop not null;

-- ficha_id em posicoes_token DEVE continuar NOT NULL (cada token aponta para uma ficha)
-- monstros criam uma ficha_t20 antes de inserir o token — não altere isso.

-- ---------------------------------------------------------------------------
-- 2. Alinhar colunas de fichas_t20 com o frontend (idempotente)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fichas_t20'
      and column_name = 'inventário'
  ) then
    alter table public.fichas_t20 rename column "inventário" to inventario;
  end if;
end $$;

alter table public.fichas_t20
  add column if not exists raca text,
  add column if not exists classe text,
  add column if not exists nivel int not null default 1,
  add column if not exists origem text,
  add column if not exists divindade text,
  add column if not exists biografia text not null default '',
  add column if not exists inventario text not null default '',
  add column if not exists for_mod smallint not null default 0,
  add column if not exists des_mod smallint not null default 0,
  add column if not exists con_mod smallint not null default 0,
  add column if not exists int_mod smallint not null default 0,
  add column if not exists sab_mod smallint not null default 0,
  add column if not exists car_mod smallint not null default 0,
  add column if not exists pv_atual int not null default 0,
  add column if not exists pv_max int not null default 0,
  add column if not exists pm_atual int not null default 0,
  add column if not exists pm_max int not null default 0,
  add column if not exists defesa int not null default 10,
  add column if not exists pericias jsonb not null default '{}'::jsonb,
  add column if not exists sprite_config jsonb not null default '{
    "pele": "#f4c4a0",
    "cabelo": "#4a3728",
    "roupa": "#3366cc",
    "estiloCabelo": "curto"
  }'::jsonb,
  add column if not exists token_url text;

update public.fichas_t20 set biografia = '' where biografia is null;
update public.fichas_t20 set inventario = '' where inventario is null;
update public.fichas_t20 set pericias = '{}'::jsonb where pericias is null;
update public.fichas_t20 set sprite_config = '{
  "pele": "#f4c4a0",
  "cabelo": "#4a3728",
  "roupa": "#3366cc",
  "estiloCabelo": "curto"
}'::jsonb where sprite_config is null;

-- Corrige fichas de PC sem dono_id (impede UPDATE pelo jogador)
update public.fichas_t20 f
set dono_id = m.usuario_id
from public.membros_campanha m
where f.campanha_id = m.campanha_id
  and f.tipo = 'pc'
  and f.dono_id is null
  and m.papel = 'jogador'
  and not exists (
    select 1 from public.fichas_t20 f2
    where f2.campanha_id = f.campanha_id
      and f2.dono_id = m.usuario_id
      and f2.tipo = 'pc'
      and f2.id <> f.id
  );

-- ---------------------------------------------------------------------------
-- 3. Recriar políticas RLS de fichas_t20
-- ---------------------------------------------------------------------------
drop policy if exists fichas_select on public.fichas_t20;
drop policy if exists fichas_insert on public.fichas_t20;
drop policy if exists fichas_update on public.fichas_t20;
drop policy if exists fichas_delete on public.fichas_t20;

-- SELECT: qualquer membro da campanha
create policy fichas_select on public.fichas_t20
  for select to authenticated
  using (public.eh_membro_campanha(campanha_id));

-- INSERT: jogador cria PC próprio; mestre cria NPC/monstro (dono_id NULL)
create policy fichas_insert on public.fichas_t20
  for insert to authenticated
  with check (
    public.eh_membro_campanha(campanha_id)
    and (
      (tipo = 'pc' and dono_id = auth.uid())
      or (tipo in ('npc', 'monstro') and public.eh_mestre_campanha(campanha_id))
    )
  );

-- UPDATE: jogador edita só o próprio PC; mestre edita qualquer ficha da campanha
create policy fichas_update on public.fichas_t20
  for update to authenticated
  using (
    (dono_id = auth.uid() and tipo = 'pc')
    or public.eh_mestre_campanha(campanha_id)
  )
  with check (
    (dono_id = auth.uid() and tipo = 'pc')
    or public.eh_mestre_campanha(campanha_id)
  );

-- DELETE: dono do PC ou mestre
create policy fichas_delete on public.fichas_t20
  for delete to authenticated
  using (
    (dono_id = auth.uid() and tipo = 'pc')
    or public.eh_mestre_campanha(campanha_id)
  );

-- ---------------------------------------------------------------------------
-- 4. Recriar políticas RLS de posicoes_token (tabuleiro)
-- ---------------------------------------------------------------------------
drop policy if exists posicoes_select on public.posicoes_token;
drop policy if exists posicoes_insert on public.posicoes_token;
drop policy if exists posicoes_update on public.posicoes_token;
drop policy if exists posicoes_delete on public.posicoes_token;

-- SELECT: qualquer membro
create policy posicoes_select on public.posicoes_token
  for select to authenticated
  using (public.eh_membro_campanha(campanha_id));

-- INSERT: mestre insere qualquer token; jogador só para ficha própria
create policy posicoes_insert on public.posicoes_token
  for insert to authenticated
  with check (
    public.eh_membro_campanha(campanha_id)
    and (
      public.eh_mestre_campanha(campanha_id)
      or exists (
        select 1 from public.fichas_t20 f
        where f.id = ficha_id
          and f.dono_id = auth.uid()
          and f.tipo = 'pc'
      )
    )
  );

-- UPDATE: mestre move qualquer token; jogador move só o próprio
create policy posicoes_update on public.posicoes_token
  for update to authenticated
  using (
    public.eh_mestre_campanha(campanha_id)
    or exists (
      select 1 from public.fichas_t20 f
      where f.id = ficha_id
        and f.dono_id = auth.uid()
        and f.tipo = 'pc'
    )
  )
  with check (
    public.eh_mestre_campanha(campanha_id)
    or exists (
      select 1 from public.fichas_t20 f
      where f.id = ficha_id
        and f.dono_id = auth.uid()
        and f.tipo = 'pc'
    )
  );

-- DELETE: apenas mestre (remover monstros do mapa)
create policy posicoes_delete on public.posicoes_token
  for delete to authenticated
  using (public.eh_mestre_campanha(campanha_id));

-- ---------------------------------------------------------------------------
-- 5. Recarregar cache do PostgREST
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';
