-- =============================================================================
-- T20 VTT — Cole este arquivo inteiro no SQL Editor do Supabase
-- Dashboard → SQL → New query → Run
-- =============================================================================
-- Arquivo espelho de: supabase/migrations/20260712000000_initial_t20_vtt_schema.sql

-- =============================================================================
-- T20 VTT — Schema inicial (Passo 1)
-- Tormenta20: atributos são modificadores diretos; testes = d20 + mod + treino
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type public.papel_campanha as enum ('gm', 'jogador');
create type public.tipo_ficha as enum ('pc', 'npc', 'monstro');

-- ---------------------------------------------------------------------------
-- USUÁRIOS (perfil público ligado ao auth.users)
-- ---------------------------------------------------------------------------
create table public.usuarios (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome_exibicao text not null,
  avatar_url    text,
  criado_em     timestamptz not null default now()
);

comment on table public.usuarios is 'Perfil do jogador/mestre; 1:1 com auth.users';

-- ---------------------------------------------------------------------------
-- CAMPANHAS (salas de jogo)
-- ---------------------------------------------------------------------------
create table public.campanhas (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  descricao       text,
  codigo_convite  text not null unique,
  mestre_id       uuid not null references public.usuarios(id) on delete cascade,
  grid_colunas    int not null default 20 check (grid_colunas between 5 and 100),
  grid_linhas     int not null default 15 check (grid_linhas between 5 and 100),
  tile_largura    int not null default 64,
  tile_altura     int not null default 32,
  notas_historia  text not null default '',
  notas_progresso text not null default '',
  discord_url     text,
  ativa           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index campanhas_mestre_idx on public.campanhas (mestre_id);
create index campanhas_codigo_idx on public.campanhas (codigo_convite);

-- ---------------------------------------------------------------------------
-- MEMBROS DA CAMPANHA
-- ---------------------------------------------------------------------------
create table public.membros_campanha (
  id           uuid primary key default gen_random_uuid(),
  campanha_id  uuid not null references public.campanhas(id) on delete cascade,
  usuario_id   uuid not null references public.usuarios(id) on delete cascade,
  papel        public.papel_campanha not null default 'jogador',
  entrou_em    timestamptz not null default now(),
  unique (campanha_id, usuario_id)
);

create index membros_campanha_usuario_idx on public.membros_campanha (usuario_id);

-- ---------------------------------------------------------------------------
-- FICHAS T20
-- ---------------------------------------------------------------------------
create table public.fichas_t20 (
  id            uuid primary key default gen_random_uuid(),
  campanha_id   uuid not null references public.campanhas(id) on delete cascade,
  dono_id       uuid references public.usuarios(id) on delete set null,
  tipo          public.tipo_ficha not null default 'pc',
  nome          text not null,
  raca          text,
  classe        text,
  nivel         int not null default 1 check (nivel between 1 and 20),
  origem        text,
  divindade     text,
  biografia     text not null default '',
  inventario    text not null default '',
  for_mod       smallint not null default 0 check (for_mod between -5 and 20),
  des_mod       smallint not null default 0 check (des_mod between -5 and 20),
  con_mod       smallint not null default 0 check (con_mod between -5 and 20),
  int_mod       smallint not null default 0 check (int_mod between -5 and 20),
  sab_mod       smallint not null default 0 check (sab_mod between -5 and 20),
  car_mod       smallint not null default 0 check (car_mod between -5 and 20),
  pv_atual      int not null default 0 check (pv_atual >= 0),
  pv_max        int not null default 0 check (pv_max >= 0),
  pm_atual      int not null default 0 check (pm_atual >= 0),
  pm_max        int not null default 0 check (pm_max >= 0),
  defesa        int not null default 10 check (defesa >= 0),
  pericias      jsonb not null default '{}'::jsonb,
  sprite_config jsonb not null default '{
    "pele": "#f4c4a0",
    "cabelo": "#4a3728",
    "roupa": "#3366cc",
    "estiloCabelo": "curto"
  }'::jsonb,
  token_url     text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint fichas_pv_atual_lte_max check (pv_atual <= pv_max),
  constraint fichas_pm_atual_lte_max check (pm_atual <= pm_max)
);

create index fichas_t20_campanha_idx on public.fichas_t20 (campanha_id);
create index fichas_t20_dono_idx on public.fichas_t20 (dono_id);

-- ---------------------------------------------------------------------------
-- POSIÇÕES DOS TOKENS
-- ---------------------------------------------------------------------------
create table public.posicoes_token (
  id             uuid primary key default gen_random_uuid(),
  campanha_id    uuid not null references public.campanhas(id) on delete cascade,
  ficha_id       uuid not null references public.fichas_t20(id) on delete cascade unique,
  grid_x         int not null default 0,
  grid_y         int not null default 0,
  visivel        boolean not null default true,
  atualizado_por uuid references public.usuarios(id) on delete set null,
  atualizado_em  timestamptz not null default now()
);

create index posicoes_token_campanha_idx on public.posicoes_token (campanha_id);

-- ---------------------------------------------------------------------------
-- INICIATIVA
-- ---------------------------------------------------------------------------
create table public.encontros (
  id           uuid primary key default gen_random_uuid(),
  campanha_id  uuid not null references public.campanhas(id) on delete cascade,
  nome         text not null default 'Combate',
  rodada       int not null default 1 check (rodada >= 1),
  turno_atual  int not null default 0,
  ativo        boolean not null default false,
  criado_em    timestamptz not null default now()
);

create table public.iniciativa (
  id          uuid primary key default gen_random_uuid(),
  encontro_id uuid not null references public.encontros(id) on delete cascade,
  ficha_id    uuid not null references public.fichas_t20(id) on delete cascade,
  valor       int not null,
  ordem       int not null default 0,
  ja_agiu     boolean not null default false,
  unique (encontro_id, ficha_id)
);

create index iniciativa_encontro_idx on public.iniciativa (encontro_id, ordem);

-- ---------------------------------------------------------------------------
-- FUNÇÕES AUXILIARES
-- ---------------------------------------------------------------------------
create or replace function public.gerar_codigo_convite()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.campanhas_before_insert()
returns trigger
language plpgsql
as $$
begin
  if new.codigo_convite is null or new.codigo_convite = '' then
    loop
      new.codigo_convite := public.gerar_codigo_convite();
      exit when not exists (select 1 from public.campanhas c where c.codigo_convite = new.codigo_convite);
    end loop;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger trg_campanhas_before_insert
  before insert on public.campanhas
  for each row execute function public.campanhas_before_insert();

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger trg_campanhas_updated before update on public.campanhas
  for each row execute function public.set_atualizado_em();
create trigger trg_fichas_updated before update on public.fichas_t20
  for each row execute function public.set_atualizado_em();
create trigger trg_posicoes_updated before update on public.posicoes_token
  for each row execute function public.set_atualizado_em();

create or replace function public.handle_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nome_exibicao)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_exibicao', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_usuario_criado
  after insert on auth.users
  for each row execute function public.handle_novo_usuario();

create or replace function public.eh_membro_campanha(p_campanha_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.membros_campanha m
    where m.campanha_id = p_campanha_id and m.usuario_id = auth.uid()
  ) or exists (
    select 1 from public.campanhas c
    where c.id = p_campanha_id and c.mestre_id = auth.uid()
  );
$$;

create or replace function public.eh_mestre_campanha(p_campanha_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.campanhas c
    where c.id = p_campanha_id and c.mestre_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.usuarios enable row level security;
alter table public.campanhas enable row level security;
alter table public.membros_campanha enable row level security;
alter table public.fichas_t20 enable row level security;
alter table public.posicoes_token enable row level security;
alter table public.encontros enable row level security;
alter table public.iniciativa enable row level security;

create policy usuarios_select on public.usuarios for select to authenticated using (true);
create policy usuarios_update_own on public.usuarios for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy campanhas_select_membro on public.campanhas for select to authenticated
  using (public.eh_membro_campanha(id));
create policy campanhas_insert_mestre on public.campanhas for insert to authenticated
  with check (mestre_id = auth.uid());
create policy campanhas_update_mestre on public.campanhas for update to authenticated
  using (public.eh_mestre_campanha(id));
create policy campanhas_delete_mestre on public.campanhas for delete to authenticated
  using (public.eh_mestre_campanha(id));

create policy membros_select on public.membros_campanha for select to authenticated
  using (public.eh_membro_campanha(campanha_id));
create policy membros_insert on public.membros_campanha for insert to authenticated
  with check (
    usuario_id = auth.uid()
    or public.eh_mestre_campanha(campanha_id)
  );
create policy membros_delete on public.membros_campanha for delete to authenticated
  using (usuario_id = auth.uid() or public.eh_mestre_campanha(campanha_id));

create policy fichas_select on public.fichas_t20 for select to authenticated
  using (public.eh_membro_campanha(campanha_id));
create policy fichas_insert on public.fichas_t20 for insert to authenticated
  with check (
    public.eh_membro_campanha(campanha_id)
    and (dono_id = auth.uid() or public.eh_mestre_campanha(campanha_id))
  );
create policy fichas_update on public.fichas_t20 for update to authenticated
  using (
    dono_id = auth.uid()
    or public.eh_mestre_campanha(campanha_id)
  );
create policy fichas_delete on public.fichas_t20 for delete to authenticated
  using (
    dono_id = auth.uid()
    or public.eh_mestre_campanha(campanha_id)
  );

create policy posicoes_select on public.posicoes_token for select to authenticated
  using (public.eh_membro_campanha(campanha_id));
create policy posicoes_insert on public.posicoes_token for insert to authenticated
  with check (public.eh_membro_campanha(campanha_id));
create policy posicoes_update on public.posicoes_token for update to authenticated
  using (
    public.eh_mestre_campanha(campanha_id)
    or exists (
      select 1 from public.fichas_t20 f
      where f.id = ficha_id and f.dono_id = auth.uid()
    )
  );
create policy posicoes_delete on public.posicoes_token for delete to authenticated
  using (public.eh_mestre_campanha(campanha_id));

create policy encontros_select on public.encontros for select to authenticated
  using (public.eh_membro_campanha(campanha_id));
create policy encontros_write on public.encontros for all to authenticated
  using (public.eh_mestre_campanha(campanha_id))
  with check (public.eh_mestre_campanha(campanha_id));

create policy iniciativa_select on public.iniciativa for select to authenticated
  using (
    exists (
      select 1 from public.encontros e
      where e.id = encontro_id and public.eh_membro_campanha(e.campanha_id)
    )
  );
create policy iniciativa_write on public.iniciativa for all to authenticated
  using (
    exists (
      select 1 from public.encontros e
      where e.id = encontro_id and public.eh_mestre_campanha(e.campanha_id)
    )
  )
  with check (
    exists (
      select 1 from public.encontros e
      where e.id = encontro_id and public.eh_mestre_campanha(e.campanha_id)
    )
  );

-- ---------------------------------------------------------------------------
-- REALTIME
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.posicoes_token;
alter publication supabase_realtime add table public.fichas_t20;
alter publication supabase_realtime add table public.campanhas;
alter publication supabase_realtime add table public.iniciativa;

-- ---------------------------------------------------------------------------
-- PASSO 4: ROLAGENS (rode também se o banco já existia antes)
-- ---------------------------------------------------------------------------
create table if not exists public.rolagens (
  id               uuid primary key default gen_random_uuid(),
  campanha_id      uuid not null references public.campanhas(id) on delete cascade,
  usuario_id       uuid not null references public.usuarios(id) on delete cascade,
  ficha_id         uuid references public.fichas_t20(id) on delete set null,
  nome_personagem  text not null,
  teste            text not null,
  expressao        text not null,
  resultados       jsonb not null default '[]'::jsonb,
  modificador      int not null default 0,
  total            int not null,
  detalhes         text not null default '',
  criado_em        timestamptz not null default now()
);

create index if not exists rolagens_campanha_idx on public.rolagens (campanha_id, criado_em desc);

alter table public.rolagens enable row level security;

drop policy if exists rolagens_select on public.rolagens;
create policy rolagens_select on public.rolagens for select to authenticated
  using (public.eh_membro_campanha(campanha_id));

drop policy if exists rolagens_insert on public.rolagens;
create policy rolagens_insert on public.rolagens for insert to authenticated
  with check (
    public.eh_membro_campanha(campanha_id)
    and usuario_id = auth.uid()
  );

do $$
begin
  alter publication supabase_realtime add table public.rolagens;
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- ALINHAMENTO fichas_t20 (rode se o banco já existia antes de biografia/inventario)
-- Conteúdo completo também em: supabase/ALINHAR-FICHAS-T20.sql
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

notify pgrst, 'reload schema';
