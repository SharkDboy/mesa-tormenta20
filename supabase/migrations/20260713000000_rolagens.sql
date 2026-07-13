-- Passo 4: histórico de rolagens com Realtime
create table public.rolagens (
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

create index rolagens_campanha_idx on public.rolagens (campanha_id, criado_em desc);

alter table public.rolagens enable row level security;

create policy rolagens_select on public.rolagens for select to authenticated
  using (public.eh_membro_campanha(campanha_id));

create policy rolagens_insert on public.rolagens for insert to authenticated
  with check (
    public.eh_membro_campanha(campanha_id)
    and usuario_id = auth.uid()
  );

alter publication supabase_realtime add table public.rolagens;
