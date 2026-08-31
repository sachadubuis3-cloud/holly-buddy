-- Holly Buddy — RLS for host/provider connections
-- Run this once in the Supabase SQL Editor on the production project.

-- The provider registry is searchable by authenticated hosts.
alter table public.providers enable row level security;

drop policy if exists "providers_authenticated_select" on public.providers;
create policy "providers_authenticated_select"
on public.providers
for select
to authenticated
using (true);

-- Hosts may only read connections belonging to an organisation they belong to.
alter table public.host_provider_connections enable row level security;

drop policy if exists "host_provider_connections_member_select" on public.host_provider_connections;
create policy "host_provider_connections_member_select"
on public.host_provider_connections
for select
to authenticated
using (public.is_org_member(host_organization_id));

-- A host may request a connection for an organisation they belong to.
drop policy if exists "host_provider_connections_member_insert" on public.host_provider_connections;
create policy "host_provider_connections_member_insert"
on public.host_provider_connections
for insert
to authenticated
with check (
  public.is_org_member(host_organization_id)
  and (requested_by is null or requested_by = auth.uid())
);

-- A host may update only connections belonging to their organisation.
drop policy if exists "host_provider_connections_member_update" on public.host_provider_connections;
create policy "host_provider_connections_member_update"
on public.host_provider_connections
for update
to authenticated
using (public.is_org_member(host_organization_id))
with check (public.is_org_member(host_organization_id));
