-- PokéQA Lab - schema (Supabase / PostgreSQL)
-- Execute no SQL Editor do Supabase. Idempotente para recriação em ambiente de demonstração.

create extension if not exists pgcrypto;

-- ===== Enums =====
do $$ begin
  create type record_status as enum ('ativo','inativo','arquivado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rarity_level as enum ('comum','incomum','raro','epico','lendario');
exception when duplicate_object then null; end $$;

-- ===== Função de updated_at =====
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ===== trainers =====
create table if not exists trainers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 80),
  username text not null check (username ~ '^[a-z0-9_]{3,20}$'),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 120),
  age int check (age between 10 and 120),
  region text,
  city text check (char_length(city) <= 60),
  birth_date date check (birth_date <= current_date),
  favorite_color text check (favorite_color ~ '^#[0-9a-fA-F]{6}$'),
  gender text check (gender in ('feminino','masculino','nao_binario','prefiro_nao_informar')),
  bio text check (char_length(bio) <= 500),
  status record_status not null default 'ativo',
  accepted_terms boolean not null check (accepted_terms = true),
  notify_email boolean not null default false,
  notify_push boolean not null default false,
  avatar_url text check (char_length(avatar_url) <= 500),
  is_demo boolean not null default true,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists trainers_username_uq on trainers (lower(username));
create unique index if not exists trainers_email_uq on trainers (lower(email));
create index if not exists trainers_status_idx on trainers (status);
drop trigger if exists trg_trainers_updated on trainers;
create trigger trg_trainers_updated before update on trainers for each row execute function set_updated_at();

-- ===== pokemon_records =====
create table if not exists pokemon_records (
  id uuid primary key default gen_random_uuid(),
  pokedex_number int not null check (pokedex_number between 1 and 2000),
  name text not null check (char_length(name) between 2 and 40),
  nickname text check (char_length(nickname) <= 30),
  primary_type text not null,
  secondary_type text,
  species text check (char_length(species) <= 60),
  height_m numeric(5,2) check (height_m >= 0 and height_m <= 100),
  weight_kg numeric(7,2) check (weight_kg >= 0 and weight_kg <= 10000),
  level int not null default 1 check (level between 1 and 100),
  hp int not null default 1 check (hp between 1 and 255),
  attack int not null default 1 check (attack between 1 and 255),
  defense int not null default 1 check (defense between 1 and 255),
  sp_attack int not null default 1 check (sp_attack between 1 and 255),
  sp_defense int not null default 1 check (sp_defense between 1 and 255),
  speed int not null default 1 check (speed between 1 and 255),
  generation int not null check (generation between 1 and 9),
  status record_status not null default 'ativo',
  rarity rarity_level not null default 'comum',
  captured_at date check (captured_at <= current_date),
  registered_at timestamptz not null default now(),
  is_favorite boolean not null default false,
  notes text check (char_length(notes) <= 500),
  image_url text check (char_length(image_url) <= 500),
  source text not null default 'custom' check (source in ('custom','pokeapi')),
  is_demo boolean not null default true,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (secondary_type is null or secondary_type <> primary_type)
);
create index if not exists pokemon_name_idx on pokemon_records (lower(name));
create index if not exists pokemon_number_idx on pokemon_records (pokedex_number);
create index if not exists pokemon_filters_idx on pokemon_records (status, generation, primary_type);
drop trigger if exists trg_pokemon_updated on pokemon_records;
create trigger trg_pokemon_updated before update on pokemon_records for each row execute function set_updated_at();

-- ===== teams =====
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 60),
  trainer_id uuid not null references trainers(id) on delete cascade,
  description text check (char_length(description) <= 300),
  strategy text check (char_length(strategy) <= 300),
  status record_status not null default 'ativo',
  is_demo boolean not null default true,
  is_seed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists teams_trainer_name_uq on teams (trainer_id, lower(name));
drop trigger if exists trg_teams_updated on teams;
create trigger trg_teams_updated before update on teams for each row execute function set_updated_at();

-- ===== team_members (máx. 6 por equipe, garantido por trigger) =====
create table if not exists team_members (
  team_id uuid not null references teams(id) on delete cascade,
  pokemon_id uuid not null references pokemon_records(id) on delete cascade,
  slot int not null check (slot between 1 and 6),
  primary key (team_id, pokemon_id),
  unique (team_id, slot)
);
create index if not exists team_members_pokemon_idx on team_members (pokemon_id);

create or replace function enforce_team_limit() returns trigger as $$
begin
  if (select count(*) from team_members where team_id = new.team_id) >= 6 then
    raise exception 'Uma equipe pode ter no máximo 6 Pokémon' using errcode = 'check_violation';
  end if;
  return new;
end; $$ language plpgsql;
drop trigger if exists trg_team_limit on team_members;
create trigger trg_team_limit before insert on team_members for each row execute function enforce_team_limit();

-- ===== activity_logs (preenchido por triggers) =====
create table if not exists activity_logs (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id uuid,
  action text not null check (action in ('criado','atualizado','excluido')),
  label text,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on activity_logs (created_at desc);

create or replace function log_activity() returns trigger as $$
declare r record; lbl text;
begin
  r := case when tg_op = 'DELETE' then old else new end;
  lbl := case tg_table_name when 'pokemon_records' then r.name when 'trainers' then r.username else r.name end;
  insert into activity_logs(entity, entity_id, action, label)
  values (tg_table_name, r.id,
          case tg_op when 'INSERT' then 'criado' when 'UPDATE' then 'atualizado' else 'excluido' end, lbl);
  return r;
end; $$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_log_pokemon on pokemon_records;
create trigger trg_log_pokemon after insert or update or delete on pokemon_records for each row execute function log_activity();
drop trigger if exists trg_log_trainers on trainers;
create trigger trg_log_trainers after insert or update or delete on trainers for each row execute function log_activity();
drop trigger if exists trg_log_teams on teams;
create trigger trg_log_teams after insert or update or delete on teams for each row execute function log_activity();

-- ===== Proteção da flag is_seed (clientes não podem promover/rebaixar linhas de seed) =====
create or replace function protect_seed_flag() returns trigger as $$
begin new.is_seed = old.is_seed; return new; end;
$$ language plpgsql;
drop trigger if exists trg_protect_seed_pokemon on pokemon_records;
create trigger trg_protect_seed_pokemon before update on pokemon_records for each row execute function protect_seed_flag();
drop trigger if exists trg_protect_seed_trainers on trainers;
create trigger trg_protect_seed_trainers before update on trainers for each row execute function protect_seed_flag();
drop trigger if exists trg_protect_seed_teams on teams;
create trigger trg_protect_seed_teams before update on teams for each row execute function protect_seed_flag();
