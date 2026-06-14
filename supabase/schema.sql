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

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  birth_date date,
  updated_at timestamptz not null default now(),
  constraint user_profiles_display_name_length check (char_length(display_name) <= 80)
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
on public.user_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
on public.user_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists user_profiles_updated_at_idx
on public.user_profiles (updated_at desc);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_users_role_check check (role = 'admin')
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin() or (select auth.uid()) = user_id);

create table if not exists public.cocktail_records (
  id text primary key,
  name text not null,
  base_spirit text not null,
  taste text[] not null default '{}',
  strength text not null,
  glass_name text not null,
  steps text[] not null default '{}',
  garnish text,
  image_status text not null default 'todo',
  image_asset_key text,
  reference_urls text[] not null default '{}',
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint cocktail_records_name_length check (char_length(name) between 1 and 120),
  constraint cocktail_records_base_spirit_length check (char_length(base_spirit) between 1 and 80),
  constraint cocktail_records_glass_name_length check (char_length(glass_name) between 1 and 80),
  constraint cocktail_records_garnish_length check (garnish is null or char_length(garnish) <= 240),
  constraint cocktail_records_strength_check check (strength in ('light', 'medium', 'strong')),
  constraint cocktail_records_taste_check check (
    taste <@ array['sweet', 'sour', 'refreshing', 'strong', 'bitter']::text[]
  ),
  constraint cocktail_records_image_status_check check (
    image_status in ('todo', 'reference-needed', 'generated', 'approved')
  )
);

alter table public.cocktail_records enable row level security;

drop policy if exists "Published cocktail records are readable" on public.cocktail_records;
create policy "Published cocktail records are readable"
on public.cocktail_records
for select
to anon, authenticated
using (is_published or public.is_admin());

drop policy if exists "Admins can insert cocktail records" on public.cocktail_records;
create policy "Admins can insert cocktail records"
on public.cocktail_records
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update cocktail records" on public.cocktail_records;
create policy "Admins can update cocktail records"
on public.cocktail_records
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete cocktail records" on public.cocktail_records;
create policy "Admins can delete cocktail records"
on public.cocktail_records
for delete
to authenticated
using (public.is_admin());

create index if not exists cocktail_records_published_name_idx
on public.cocktail_records (is_published, name);

create index if not exists cocktail_records_updated_at_idx
on public.cocktail_records (updated_at desc);

create table if not exists public.cocktail_ingredient_links (
  cocktail_id text not null references public.cocktail_records(id) on delete cascade,
  ingredient_id text not null,
  sort_order integer not null,
  amount text not null,
  primary key (cocktail_id, sort_order),
  constraint cocktail_ingredient_links_sort_order_check check (sort_order >= 0),
  constraint cocktail_ingredient_links_ingredient_id_length check (char_length(ingredient_id) between 1 and 120),
  constraint cocktail_ingredient_links_amount_length check (char_length(amount) between 1 and 120)
);

alter table public.cocktail_ingredient_links enable row level security;

drop policy if exists "Published cocktail ingredient links are readable" on public.cocktail_ingredient_links;
create policy "Published cocktail ingredient links are readable"
on public.cocktail_ingredient_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cocktail_records
    where cocktail_records.id = cocktail_ingredient_links.cocktail_id
      and (cocktail_records.is_published or public.is_admin())
  )
);

drop policy if exists "Admins can insert cocktail ingredient links" on public.cocktail_ingredient_links;
create policy "Admins can insert cocktail ingredient links"
on public.cocktail_ingredient_links
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update cocktail ingredient links" on public.cocktail_ingredient_links;
create policy "Admins can update cocktail ingredient links"
on public.cocktail_ingredient_links
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete cocktail ingredient links" on public.cocktail_ingredient_links;
create policy "Admins can delete cocktail ingredient links"
on public.cocktail_ingredient_links
for delete
to authenticated
using (public.is_admin());

create index if not exists cocktail_ingredient_links_cocktail_id_idx
on public.cocktail_ingredient_links (cocktail_id);

-- After running this schema, grant yourself admin access once:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'sergkreis@gmail.com'
-- on conflict (user_id) do nothing;
