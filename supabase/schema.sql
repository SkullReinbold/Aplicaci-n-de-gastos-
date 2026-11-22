-- Ejecutar en Supabase > SQL Editor
create table public.expenses (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  description text not null check (char_length(description) <= 80),
  category_id text not null,
  date timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

-- Cada usuario solo ve y modifica sus propios gastos
create policy "own expenses" on public.expenses
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
