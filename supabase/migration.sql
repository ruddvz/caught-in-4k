-- ============================================================
-- C4K Subscription System — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. USERS TABLE
-- Extends Supabase Auth with C4K-specific fields
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    display_name text not null default '',
    avatar_index int not null default 0,
    status text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
    is_admin boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    plan text not null check (plan in ('1mo', '3mo', '6mo')),
    price_cents int not null,
    stripe_session_id text,
    stripe_payment_intent_id text,
    stripe_subscription_id text,
    status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
    started_at timestamptz not null default now(),
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

alter table if exists public.subscriptions
    add column if not exists stripe_payment_intent_id text;

-- 3. USER ADDONS TABLE
create table if not exists public.user_addons (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    addon_transport_url text not null,
    addon_name text not null default '',
    enabled boolean not null default true,
    added_by text not null default 'system' check (added_by in ('system', 'admin')),
    created_at timestamptz not null default now(),
    unique(user_id, addon_transport_url)
);

create table if not exists public.stripe_payment_reversals (
    payment_intent_id text primary key,
    event_type text not null,
    recorded_at timestamptz not null default now()
);

-- 4. INDEX for fast lookups
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create unique index if not exists idx_subscriptions_stripe_session on public.subscriptions(stripe_session_id) where stripe_session_id is not null;
create index if not exists idx_subscriptions_payment_intent on public.subscriptions(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index if not exists idx_user_addons_user on public.user_addons(user_id);

-- 5. AUTO-UPDATE updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
    before update on public.users
    for each row execute function public.update_updated_at();

-- 6. AUTO-CREATE user row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, email, display_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- 7. ROW LEVEL SECURITY
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_addons enable row level security;
alter table public.stripe_payment_reversals enable row level security;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.users
        where id = auth.uid()
          and is_admin = true
          and status = 'approved'
    );
$$;

create or replace function public.is_current_user_entitled()
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.users
        where id = auth.uid()
          and (
                            public.is_current_user_admin() = true
              or (
                  status = 'approved'
                  and exists (
                      select 1
                      from public.subscriptions
                      where user_id = auth.uid()
                        and status = 'active'
                        and expires_at >= now()
                  )
              )
          )
    );
$$;

create or replace function public.require_current_user_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_current_user_admin() then
        raise exception 'Admin access required'
            using errcode = '42501';
    end if;
end;
$$;

create or replace function public.is_safe_addon_transport_url(transport_url text)
returns boolean
language plpgsql
immutable
as $$
declare
    normalized_url text := btrim(coalesce(transport_url, ''));
    authority text;
    host text;
begin
    if normalized_url = '' or normalized_url !~* '^https://[^/?#\s]+' then
        return false;
    end if;

    authority := substring(normalized_url from '^https://([^/?#]+)');
    if authority is null or authority = '' or strpos(authority, '@') > 0 or authority like '[%' then
        return false;
    end if;

    host := regexp_replace(lower(split_part(authority, ':', 1)), '\.$', '');
    if host = '' then
        return false;
    end if;

    if host in ('localhost', '127.0.0.1', '0.0.0.0', '::1', 'localtest.me', 'lvh.me')
        or host like '%.localhost'
        or host like '%.localtest.me'
        or host like '%.lvh.me'
        or host like '%.nip.io'
        or host like '%.sslip.io'
        or right(host, 6) = '.local' then
        return false;
    end if;

    if host ~ '^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)' then
        return false;
    end if;

    return true;
end;
$$;

-- Users: read own row, admin reads all
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_select_admin" on public.users;
create policy "users_select_own" on public.users
    for select using (auth.uid() = id);
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_update_admin" on public.users;

-- Subscriptions: read own
drop policy if exists "subs_select_own" on public.subscriptions;
drop policy if exists "subs_select_admin" on public.subscriptions;
drop policy if exists "subs_insert_admin" on public.subscriptions;
drop policy if exists "subs_update_admin" on public.subscriptions;
create policy "subs_select_own" on public.subscriptions
    for select using (user_id = auth.uid());

-- User addons: read own when entitled
drop policy if exists "addons_select_own" on public.user_addons;
drop policy if exists "addons_select_admin" on public.user_addons;
drop policy if exists "addons_insert_admin" on public.user_addons;
drop policy if exists "addons_update_admin" on public.user_addons;
drop policy if exists "addons_delete_admin" on public.user_addons;
create policy "addons_select_own" on public.user_addons
    for select using (user_id = auth.uid() and public.is_current_user_entitled());

create or replace function public.admin_list_users()
returns table (
    id uuid,
    email text,
    display_name text,
    status text,
    is_admin boolean,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    perform public.require_current_user_admin();

    return query
    select
        users.id,
        users.email,
        users.display_name,
        users.status,
        users.is_admin,
        users.created_at
    from public.users
    order by users.created_at desc;
end;
$$;

create or replace function public.admin_list_user_addons()
returns table (
    id uuid,
    user_id uuid,
    addon_transport_url text,
    addon_name text,
    enabled boolean,
    added_by text,
    created_at timestamptz,
    user_email text,
    user_display_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    perform public.require_current_user_admin();

    return query
    select
        user_addons.id,
        user_addons.user_id,
        user_addons.addon_transport_url,
        user_addons.addon_name,
        user_addons.enabled,
        user_addons.added_by,
        user_addons.created_at,
        users.email as user_email,
        users.display_name as user_display_name
    from public.user_addons
    join public.users on users.id = user_addons.user_id
    order by user_addons.created_at desc;
end;
$$;

create or replace function public.admin_list_subscriptions()
returns table (
    id uuid,
    user_id uuid,
    plan text,
    price_cents int,
    status text,
    started_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz,
    user_email text,
    user_display_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    perform public.require_current_user_admin();

    return query
    select
        subscriptions.id,
        subscriptions.user_id,
        subscriptions.plan,
        subscriptions.price_cents,
        subscriptions.status,
        subscriptions.started_at,
        subscriptions.expires_at,
        subscriptions.created_at,
        users.email as user_email,
        users.display_name as user_display_name
    from public.subscriptions
    join public.users on users.id = subscriptions.user_id
    order by subscriptions.created_at desc;
end;
$$;

create or replace function public.admin_update_user_status(target_user_id uuid, next_status text)
returns table (
    id uuid,
    status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    perform public.require_current_user_admin();

    if next_status not in ('pending', 'approved', 'suspended') then
        raise exception 'Invalid account status'
            using errcode = '22023';
    end if;

    return query
    update public.users
    set status = next_status
    where users.id = target_user_id
      and users.is_admin = false
    returning users.id, users.status;

    if not found then
        raise exception 'Managed user not found'
            using errcode = 'P0002';
    end if;
end;
$$;

create or replace function public.admin_upsert_user_addon(
    target_user_id uuid,
    target_addon_name text,
    target_addon_transport_url text
)
returns table (
    id uuid,
    user_id uuid,
    addon_transport_url text,
    addon_name text,
    enabled boolean,
    added_by text,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
    normalized_transport_url text := btrim(coalesce(target_addon_transport_url, ''));
    normalized_addon_name text := btrim(coalesce(target_addon_name, ''));
begin
    perform public.require_current_user_admin();

    if normalized_addon_name = '' then
        raise exception 'Addon name is required'
            using errcode = '22023';
    end if;

    if not exists (
        select 1
        from public.users
        where users.id = target_user_id
          and users.is_admin = false
    ) then
        raise exception 'Managed user not found'
            using errcode = 'P0002';
    end if;

    if not public.is_safe_addon_transport_url(normalized_transport_url) then
        raise exception 'Transport URL must use https and a public host'
            using errcode = '22023';
    end if;

    return query
    insert into public.user_addons (
        user_id,
        addon_name,
        addon_transport_url,
        added_by,
        enabled
    )
    values (
        target_user_id,
        normalized_addon_name,
        normalized_transport_url,
        'admin',
        true
    )
    on conflict (user_id, addon_transport_url)
    do update set
        addon_name = excluded.addon_name,
        added_by = 'admin',
        enabled = true
    returning
        user_addons.id,
        user_addons.user_id,
        user_addons.addon_transport_url,
        user_addons.addon_name,
        user_addons.enabled,
        user_addons.added_by,
        user_addons.created_at;
end;
$$;

create or replace function public.admin_remove_user_addon(target_addon_id uuid)
returns table (
    id uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
    perform public.require_current_user_admin();

    return query
    delete from public.user_addons
    where user_addons.id = target_addon_id
    returning user_addons.id;

    if not found then
        raise exception 'Curated addon not found'
            using errcode = 'P0002';
    end if;
end;
$$;

revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_list_user_addons() from public;
revoke all on function public.admin_list_subscriptions() from public;
revoke all on function public.admin_update_user_status(uuid, text) from public;
revoke all on function public.admin_upsert_user_addon(uuid, text, text) from public;
revoke all on function public.admin_remove_user_addon(uuid) from public;

grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_list_user_addons() to authenticated;
grant execute on function public.admin_list_subscriptions() to authenticated;
grant execute on function public.admin_update_user_status(uuid, text) to authenticated;
grant execute on function public.admin_upsert_user_addon(uuid, text, text) to authenticated;
grant execute on function public.admin_remove_user_addon(uuid) to authenticated;

-- 8. CREATE YOUR ADMIN ACCOUNT
-- After running this migration, sign up through the app, then run:
-- UPDATE public.users SET is_admin = true, status = 'approved' WHERE email = 'YOUR_EMAIL_HERE';
