-- Caught in 4K — baseline RLS policies (apply in Supabase SQL editor or via CLI)
-- Users may only read/write rows where auth.uid() = user_id

alter table if exists public.profiles enable row level security;
alter table if exists public.subscriptions enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
    for select using (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
    for update using (auth.uid() = user_id);

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
    for select using (auth.uid() = user_id);
