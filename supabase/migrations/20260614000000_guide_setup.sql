-- Caught in 4K — Guide ($30) + Account Setup ($120) products
-- Separate from the Pro/Max streaming subscription.

-- 1. Guide unlock flag on the user profile (read by AuthProvider via select('*')).
alter table if exists public.users
    add column if not exists guide_unlocked boolean not null default false;

-- 2. Done-for-you setup requests.
--    Stores the customer's chosen login so the operator can provision the
--    account by hand. desired_password is sensitive — it is locked to admins
--    only (below) and should be cleared once the account is provisioned.
create table if not exists public.setup_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete set null,
    email text not null,
    server_tier text not null,
    desired_username text,
    desired_password text,
    devices text,
    notes text,
    status text not null default 'new',
    created_at timestamptz not null default now(),
    fulfilled_at timestamptz,
    term_expires_at timestamptz
);

alter table public.setup_requests enable row level security;

-- Only admins may read/update/delete requests. Inserts are performed by the
-- backend with the service-role key, which bypasses RLS — so there is no public
-- read/write path to the stored credentials.
drop policy if exists setup_requests_admin_all on public.setup_requests;
create policy setup_requests_admin_all on public.setup_requests
    for all
    using (
        exists (
            select 1 from public.users u
            where u.id = auth.uid() and u.is_admin = true
        )
    );

create index if not exists setup_requests_status_idx on public.setup_requests (status, created_at desc);
