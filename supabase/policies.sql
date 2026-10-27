-- PokéQA Lab - RLS
-- Modelo: demonstração pública. Leitura aberta; escrita aberta apenas para linhas is_demo = true
-- (a flag é forçada pelo WITH CHECK). Limites e formatos são garantidos por CHECKs/triggers do schema.
-- activity_logs é somente leitura para o cliente (escrita via trigger SECURITY DEFINER).

alter table pokemon_records enable row level security;
alter table trainers        enable row level security;
alter table teams           enable row level security;
alter table team_members    enable row level security;
alter table activity_logs   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['pokemon_records','trainers','teams'] loop
    execute format('drop policy if exists "%1$s_select" on %1$s', t);
    execute format('drop policy if exists "%1$s_insert" on %1$s', t);
    execute format('drop policy if exists "%1$s_update" on %1$s', t);
    execute format('drop policy if exists "%1$s_delete" on %1$s', t);
    execute format('create policy "%1$s_select" on %1$s for select to anon, authenticated using (true)', t);
    execute format('create policy "%1$s_insert" on %1$s for insert to anon, authenticated with check (is_demo = true and is_seed = false)', t);
    execute format('create policy "%1$s_update" on %1$s for update to anon, authenticated using (is_demo = true) with check (is_demo = true)', t);
    execute format('create policy "%1$s_delete" on %1$s for delete to anon, authenticated using (is_demo = true)', t);
  end loop;
end $$;

drop policy if exists team_members_select on team_members;
drop policy if exists team_members_insert on team_members;
drop policy if exists team_members_update on team_members;
drop policy if exists team_members_delete on team_members;
create policy team_members_select on team_members for select to anon, authenticated using (true);
create policy team_members_insert on team_members for insert to anon, authenticated
  with check (exists (select 1 from teams t where t.id = team_id and t.is_demo));
create policy team_members_update on team_members for update to anon, authenticated
  using (exists (select 1 from teams t where t.id = team_id and t.is_demo))
  with check (exists (select 1 from teams t where t.id = team_id and t.is_demo));
create policy team_members_delete on team_members for delete to anon, authenticated
  using (exists (select 1 from teams t where t.id = team_id and t.is_demo));

drop policy if exists activity_logs_select on activity_logs;
create policy activity_logs_select on activity_logs for select to anon, authenticated using (true);

-- Privilégios: remove escrita direta em activity_logs
revoke insert, update, delete on activity_logs from anon, authenticated;
