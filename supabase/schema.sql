create table if not exists public.user_bars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ingredient_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_bars enable row level security;

drop policy if exists "Users can read their own bar" on public.user_bars;
create policy "Users can read their own bar"
on public.user_bars
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own bar" on public.user_bars;
create policy "Users can insert their own bar"
on public.user_bars
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own bar" on public.user_bars;
create policy "Users can update their own bar"
on public.user_bars
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists user_bars_updated_at_idx
on public.user_bars (updated_at desc);

create table if not exists public.user_favorites (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cocktail_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_favorites enable row level security;

drop policy if exists "Users can read their own favorites" on public.user_favorites;
create policy "Users can read their own favorites"
on public.user_favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own favorites" on public.user_favorites;
create policy "Users can insert their own favorites"
on public.user_favorites
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own favorites" on public.user_favorites;
create policy "Users can update their own favorites"
on public.user_favorites
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists user_favorites_updated_at_idx
on public.user_favorites (updated_at desc);
