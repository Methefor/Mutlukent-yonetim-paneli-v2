-- Enable extensions
create extension if not exists pgcrypto;

-- Roles enum
do $$ begin
  create type user_role as enum ('genel_mudur','koordinator','sube_muduru','muhasebe','ik','admin');
exception when duplicate_object then null; end $$;

-- Core tables
create table if not exists public.subeler (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  role user_role not null default 'sube_muduru',
  sube_id uuid null references public.subeler(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Supporting mapping for coordinators responsible branches
create table if not exists public.coordinator_branches (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sube_id uuid not null references public.subeler(id) on delete cascade,
  primary key (profile_id, sube_id)
);

-- Data tables
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  ciro numeric(12,2) not null,
  z_rapor_no text not null,
  sube_id uuid references public.subeler(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  supplier text not null,
  items text not null,
  sube_id uuid references public.subeler(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  status text not null default 'open',
  sube_id uuid references public.subeler(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  sube_id uuid references public.subeler(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.hr_records (
  id uuid primary key default gen_random_uuid(),
  staff_name text not null,
  movement text not null,
  sube_id uuid references public.subeler(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- View for reading user emails without admin key
create or replace view public.users_view as select id, email from auth.users;

-- Helper functions
create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function public.current_sube_id()
returns uuid language sql stable security definer set search_path = public as $$
  select sube_id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where user_id = auth.uid()), 'sube_muduru') in ('admin')
$$;

-- Triggers: create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Seed minimal branches
insert into public.subeler (id, name)
values
  (gen_random_uuid(), 'Genel Merkez')
on conflict do nothing;

-- RLS enable
alter table public.profiles enable row level security;
alter table public.coordinator_branches enable row level security;
alter table public.sales enable row level security;
alter table public.orders enable row level security;
alter table public.tickets enable row level security;
alter table public.documents enable row level security;
alter table public.hr_records enable row level security;

-- Profiles policies
create policy "read_own_profile_or_admin" on public.profiles for select
  using (
    auth.uid() = user_id
    or public.current_role() in ('admin')
  );

create policy "update_own_profile" on public.profiles for update
  using (auth.uid() = user_id);

create policy "admin_update_any_profile" on public.profiles for update
  using (public.current_role() in ('admin'));

-- Coordinator branches policies (admin manage, self read)
create policy "read_own_mapping" on public.coordinator_branches for select
  using (exists(select 1 from public.profiles p where p.id = coordinator_branches.profile_id and p.user_id = auth.uid()) or public.current_role() in ('admin'));
create policy "admin_manage_mappings" on public.coordinator_branches for all
  using (public.current_role() in ('admin')) with check (public.current_role() in ('admin'));

-- Helper predicate for coordinator access
create or replace function public.coordinator_has_access(target_sube uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.coordinator_branches cb
    where cb.profile_id = public.current_profile_id() and cb.sube_id = target_sube
  )
$$;

-- SALES policies
create policy "sales_select" on public.sales for select
  using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(sales.sube_id))
  );

create policy "sales_write" on public.sales for insert
  with check (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(sales.sube_id))
  );

create policy "sales_update_delete" on public.sales for update using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(sales.sube_id))
  );
create policy "sales_delete" on public.sales for delete using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(sales.sube_id))
  );

-- ORDERS policies
create policy "orders_select" on public.orders for select
  using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(orders.sube_id))
  );
create policy "orders_write" on public.orders for insert with check (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(orders.sube_id))
  );
create policy "orders_update" on public.orders for update using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(orders.sube_id))
  );
create policy "orders_delete" on public.orders for delete using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(orders.sube_id))
  );

-- TICKETS policies
create policy "tickets_select" on public.tickets for select
  using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(tickets.sube_id))
  );
create policy "tickets_write" on public.tickets for insert with check (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(tickets.sube_id))
  );
create policy "tickets_update" on public.tickets for update using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(tickets.sube_id))
  );
create policy "tickets_delete" on public.tickets for delete using (
    public.current_role() in ('admin','genel_mudur')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(tickets.sube_id))
  );

-- DOCUMENTS policies (muhasebe full access)
create policy "documents_select" on public.documents for select
  using (
    public.current_role() in ('admin','genel_mudur','muhasebe')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(documents.sube_id))
  );
create policy "documents_write" on public.documents for insert with check (
    public.current_role() in ('admin','genel_mudur','muhasebe')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(documents.sube_id))
  );
create policy "documents_update" on public.documents for update using (
    public.current_role() in ('admin','genel_mudur','muhasebe')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(documents.sube_id))
  );
create policy "documents_delete" on public.documents for delete using (
    public.current_role() in ('admin','genel_mudur','muhasebe')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(documents.sube_id))
  );

-- HR policies (IK full access, others read-only by branch)
create policy "hr_select" on public.hr_records for select
  using (
    public.current_role() in ('admin','genel_mudur','ik')
    or (public.current_role() = 'sube_muduru' and sube_id = public.current_sube_id())
    or (public.current_role() = 'koordinator' and public.coordinator_has_access(hr_records.sube_id))
  );
create policy "hr_write" on public.hr_records for insert with check (
    public.current_role() in ('admin','genel_mudur','ik')
  );
create policy "hr_update_delete" on public.hr_records for update using (
    public.current_role() in ('admin','genel_mudur','ik')
  );
create policy "hr_delete" on public.hr_records for delete using (
    public.current_role() in ('admin','genel_mudur','ik')
  );

-- Storage setup (run in SQL editor once)
-- select storage.create_bucket('documents', public => true);
-- select storage.create_bucket('avatars', public => true);

-- Storage RLS
-- Allow everyone authenticated to read documents & avatars
create policy if not exists "storage_read" on storage.objects for select using (
  bucket_id in ('documents','avatars')
);

-- Allow owners or privileged roles to manage documents
create policy if not exists "storage_insert_docs" on storage.objects for insert with check (
  bucket_id = 'documents' and (owner = auth.uid() or public.current_role() in ('admin','genel_mudur','muhasebe'))
);
create policy if not exists "storage_update_docs" on storage.objects for update using (
  bucket_id = 'documents' and (owner = auth.uid() or public.current_role() in ('admin','genel_mudur','muhasebe'))
);
create policy if not exists "storage_delete_docs" on storage.objects for delete using (
  bucket_id = 'documents' and (owner = auth.uid() or public.current_role() in ('admin','genel_mudur','muhasebe'))
);

-- Avatars writable by owner
create policy if not exists "storage_insert_avatars" on storage.objects for insert with check (
  bucket_id = 'avatars' and owner = auth.uid()
);
create policy if not exists "storage_update_avatars" on storage.objects for update using (
  bucket_id = 'avatars' and owner = auth.uid()
);
create policy if not exists "storage_delete_avatars" on storage.objects for delete using (
  bucket_id = 'avatars' and owner = auth.uid()
);

