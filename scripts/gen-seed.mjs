// Gera supabase/seed.sql (dados 100% fictícios). Uso: node scripts/gen-seed.mjs
import { writeFileSync } from 'node:fs'
const q = (v) => v === null ? 'null' : typeof v === 'number' ? String(v) : typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`
const uid = (p, n) => `00000000-0000-4000-${p}-${String(n).padStart(12, '0')}`
const art = (n) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n}.png`

// [dex, nome, tipo1, tipo2, geração, hp, atk, def, spa, spd, spe, altura, peso, raridade]
const mons = [
 [1,'Bulbasaur','grass','poison',1,45,49,49,65,65,45,0.7,6.9,'comum'],
 [4,'Charmander','fire',null,1,39,52,43,60,50,65,0.6,8.5,'comum'],
 [7,'Squirtle','water',null,1,44,48,65,50,64,43,0.5,9.0,'comum'],
 [25,'Pikachu','electric',null,1,35,55,40,50,50,90,0.4,6.0,'incomum'],
 [39,'Jigglypuff','normal','fairy',1,115,45,20,45,25,20,0.5,5.5,'comum'],
 [54,'Psyduck','water',null,1,50,52,48,65,50,55,0.8,19.6,'comum'],
 [94,'Gengar','ghost','poison',1,60,65,60,130,75,110,1.5,40.5,'raro'],
 [130,'Gyarados','water','flying',1,95,125,79,60,100,81,6.5,235.0,'raro'],
 [143,'Snorlax','normal',null,1,160,110,65,65,110,30,2.1,460.0,'raro'],
 [149,'Dragonite','dragon','flying',1,91,134,95,100,100,80,2.2,210.0,'epico'],
 [150,'Mewtwo','psychic',null,1,106,110,90,154,90,130,2.0,122.0,'lendario'],
 [152,'Chikorita','grass',null,2,45,49,65,49,65,45,0.9,6.4,'comum'],
 [158,'Totodile','water',null,2,50,65,64,44,48,43,0.6,9.5,'comum'],
 [181,'Ampharos','electric',null,2,90,75,85,115,90,55,1.4,61.5,'incomum'],
 [196,'Espeon','psychic',null,2,65,65,60,130,95,110,0.9,26.5,'raro'],
 [248,'Tyranitar','rock','dark',2,100,134,110,95,100,61,2.0,202.0,'epico'],
 [249,'Lugia','psychic','flying',2,106,90,130,90,154,110,5.2,216.0,'lendario'],
 [252,'Treecko','grass',null,3,40,45,35,65,55,70,0.5,5.0,'comum'],
 [258,'Mudkip','water',null,3,50,70,50,50,50,40,0.4,7.6,'comum'],
 [282,'Gardevoir','psychic','fairy',3,68,65,65,125,115,80,1.6,48.4,'raro'],
 [373,'Salamence','dragon','flying',3,95,135,80,110,80,100,1.5,102.6,'epico'],
 [384,'Rayquaza','dragon','flying',3,105,150,90,150,90,95,7.0,206.5,'lendario'],
 [387,'Turtwig','grass',null,4,55,68,64,45,55,31,0.4,10.2,'comum'],
 [448,'Lucario','fighting','steel',4,70,110,70,115,70,90,1.2,54.0,'raro'],
 [445,'Garchomp','dragon','ground',4,108,130,95,80,85,102,1.9,95.0,'epico'],
 [495,'Snivy','grass',null,5,45,45,55,45,55,63,0.6,8.1,'comum'],
 [571,'Zoroark','dark',null,5,60,105,60,120,60,105,1.6,81.1,'raro'],
 [658,'Greninja','water','dark',6,72,95,67,103,71,122,1.5,40.0,'epico'],
 [700,'Sylveon','fairy',null,6,95,65,65,110,130,60,1.0,23.5,'incomum'],
 [724,'Decidueye','grass','ghost',7,78,107,75,100,100,70,1.6,36.6,'raro'],
]
const statuses = ['ativo','ativo','ativo','inativo','arquivado']
const sources = ['custom','pokeapi']
const pk = mons.map((m, i) => {
  const [dex,name,t1,t2,gen,hp,atk,def,spa,spd,spe,h,w,rar] = m
  const d = new Date(Date.UTC(2025, i % 12, 1 + (i * 3) % 27)).toISOString().slice(0, 10)
  const ts = new Date(Date.UTC(2026, 0, 1 + i, 9 + (i % 8), (i * 7) % 60)).toISOString()
  return `(${q(uid('8001', i + 1))},${dex},${q(name)},${i % 3 === 0 ? q(name + ' Jr.') : 'null'},${q(t1)},${q(t2)},${q('Espécie ' + name)},${h},${w},${5 + ((i * 7) % 90)},${hp},${atk},${def},${spa},${spd},${spe},${gen},${q(statuses[i % 5])},${q(rar)},${q(d)},${q(ts)},${i % 4 === 0},${q('Registro fictício de demonstração.')},${q(art(dex))},${q(sources[i % 2])},true,true)`
})
const regions = ['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola','Galar','Paldea','Kanto']
const trainerNames = ['Ana Souza','Bruno Lima','Carla Mendes','Diego Rocha','Elisa Prado','Fábio Nunes','Gabriela Alves','Hugo Teixeira','Inês Carvalho','João Pereira']
const trs = trainerNames.map((n, i) => {
  const u = n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '_')
  const bd = new Date(Date.UTC(1985 + i * 2, i % 12, 5 + i)).toISOString().slice(0, 10)
  const colors = ['#e63946','#457b9d','#2a9d8f','#f4a261','#6a4c93','#1d3557','#8d99ae','#06d6a0','#ef476f','#ffb703']
  return `(${q(uid('8002', i + 1))},${q(n)},${q(u)},${q(u + '@exemplo.test')},${2026 - (1985 + i * 2)},${q(regions[i])},${q('Cidade ' + (i + 1))},${q(bd)},${q(colors[i])},${q(['feminino','masculino','nao_binario','prefiro_nao_informar'][i % 4])},${q('Treinador fictício para testes.')},${q(i % 6 === 5 ? 'inativo' : 'ativo')},true,${i % 2 === 0},${i % 3 === 0},null,true,true)`
})
const teamNames = ['Time Alfa','Time Beta','Trovão Azul','Floresta Viva','Guardiões do Lago']
const tms = teamNames.map((n, i) => `(${q(uid('8003', i + 1))},${q(n)},${q(uid('8002', i + 1))},${q('Equipe de demonstração ' + n)},${q('Estratégia equilibrada')},${q(i === 4 ? 'inativo' : 'ativo')},true,true)`)
const members = []
tms.forEach((_, t) => { for (let s = 1; s <= 3 + (t % 4); s++) members.push(`(${q(uid('8003', t + 1))},${q(uid('8001', t * 5 + s))},${s})`) })

const sql = `-- PokéQA Lab - seed (gerado por scripts/gen-seed.mjs). Dados fictícios.
create table if not exists app_settings (key text primary key, value text not null);
insert into app_settings(key, value) values ('demo_mode','true') on conflict (key) do nothing;
alter table app_settings enable row level security;
drop policy if exists app_settings_select on app_settings;
create policy app_settings_select on app_settings for select to anon, authenticated using (true);
revoke insert, update, delete on app_settings from anon, authenticated;

create or replace function seed_demo_data() returns void as $$
begin
  insert into trainers (id,full_name,username,email,age,region,city,birth_date,favorite_color,gender,bio,status,accepted_terms,notify_email,notify_push,avatar_url,is_demo,is_seed) values
  ${trs.join(',\n  ')}
  on conflict (id) do nothing;

  insert into pokemon_records (id,pokedex_number,name,nickname,primary_type,secondary_type,species,height_m,weight_kg,level,hp,attack,defense,sp_attack,sp_defense,speed,generation,status,rarity,captured_at,registered_at,is_favorite,notes,image_url,source,is_demo,is_seed) values
  ${pk.join(',\n  ')}
  on conflict (id) do nothing;

  insert into teams (id,name,trainer_id,description,strategy,status,is_demo,is_seed) values
  ${tms.join(',\n  ')}
  on conflict (id) do nothing;

  insert into team_members (team_id,pokemon_id,slot) values
  ${members.join(',\n  ')}
  on conflict do nothing;
end; $$ language plpgsql security definer set search_path = public;

-- Restaura APENAS as linhas de seed (is_seed = true). Registros criados por visitantes não são tocados.
-- Exige demo_mode = 'true' e a confirmação textual 'RESTAURAR'.
create or replace function reset_demo_data(confirmation text) returns void as $$
begin
  if coalesce((select value from app_settings where key = 'demo_mode'), 'false') <> 'true' then
    raise exception 'Reset desabilitado: demo_mode não está ativo' using errcode = 'insufficient_privilege';
  end if;
  if confirmation is distinct from 'RESTAURAR' then
    raise exception 'Confirmação inválida: envie RESTAURAR' using errcode = 'check_violation';
  end if;
  delete from team_members where team_id in (select id from teams where is_seed);
  delete from teams where is_seed;
  delete from pokemon_records where is_seed;
  delete from trainers where is_seed;
  perform seed_demo_data();
end; $$ language plpgsql security definer set search_path = public;

revoke execute on function seed_demo_data() from public, anon, authenticated;
revoke execute on function reset_demo_data(text) from public;
grant execute on function reset_demo_data(text) to anon, authenticated;

select seed_demo_data();
`
writeFileSync('supabase/seed.sql', sql)
console.log('seed.sql:', pk.length, 'pokémon,', trs.length, 'treinadores,', tms.length, 'equipes,', members.length, 'membros')
