-- Holly Buddy: RLS policies for host/provider connections
-- Safe to run repeatedly: drops only the policies owned by this feature.

alter table public.host_provider_connections enable row level security;

 drop policy if exists "host_provider_connections_select_org" on public.host_provider_connections;
 drop policy if exists "host_provider_connections_insert_org" on public.host_provider_connections;
 drop policy if exists "host_provider_connections_update_org" on public.host_provider_connections;

create policy "host_provider_connections_select_org"
on public.host_provider_connections
for select
to authenticated
using (
  host_organization_id in (
    select m.organization_id
    from public.memberships m
    where m.user_id = auth.uid()
  )
);

create policy "host_provider_connections_insert_org"
on public.host_provider_connections
for insert
to authenticated
with check (
  host_organization_id in (
    select m.organization_id
    from public.memberships m
    where m.user_id = auth.uid()
  )
  and requested_by = auth.uid()
);

create policy "host_provider_connections_update_org"
on public.host_provider_connections
for update
to authenticated
using (
  host_organization_id in (
    select m.organization_id
    from public.memberships m
    where m.user_id = auth.uid()
  )
)
with check (
  host_organization_id in (
    select m.organization_id
    from public.memberships m
    where m.user_id = auth.uid()
  )
);
