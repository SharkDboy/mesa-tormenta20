-- Passo 3: campos de biografia e inventário na ficha T20
alter table public.fichas_t20
  add column if not exists biografia text not null default '',
  add column if not exists inventario text not null default '';
