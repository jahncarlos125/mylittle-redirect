-- 2026-08-12 site forms: test_signups + feedback (RLS insert-only)
create table public.test_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  source text default 'site',
  created_at timestamptz default now()
);
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  kind text not null check (kind in ('bug','ideia','elogio','outro')),
  message text not null,
  created_at timestamptz default now()
);
alter table public.test_signups enable row level security;
alter table public.feedback enable row level security;
create policy "anon insert signups" on public.test_signups for insert to anon with check (true);
create policy "anon insert feedback" on public.feedback for insert to anon with check (true);
-- sem policies de select/update/delete → leitura só via dashboard/service role
