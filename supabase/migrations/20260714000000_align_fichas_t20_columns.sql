-- Alinhamento idempotente: fichas_t20 ↔ frontend (ver também ALINHAR-FICHAS-T20.sql)

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
