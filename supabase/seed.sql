-- PokéQA Lab - seed (gerado por scripts/gen-seed.mjs). Dados fictícios.
create table if not exists app_settings (key text primary key, value text not null);
insert into app_settings(key, value) values ('demo_mode','true') on conflict (key) do nothing;
alter table app_settings enable row level security;
drop policy if exists app_settings_select on app_settings;
create policy app_settings_select on app_settings for select to anon, authenticated using (true);
revoke insert, update, delete on app_settings from anon, authenticated;

create or replace function seed_demo_data() returns void as $$
begin
  insert into trainers (id,full_name,username,email,age,region,city,birth_date,favorite_color,gender,bio,status,accepted_terms,notify_email,notify_push,avatar_url,is_demo,is_seed) values
  ('00000000-0000-4000-8002-000000000001','Ana Souza','ana_souza','ana_souza@exemplo.test',41,'Kanto','Cidade 1','1985-01-05','#e63946','feminino','Treinador fictício para testes.','ativo',true,true,true,null,true,true),
  ('00000000-0000-4000-8002-000000000002','Bruno Lima','bruno_lima','bruno_lima@exemplo.test',39,'Johto','Cidade 2','1987-02-06','#457b9d','masculino','Treinador fictício para testes.','ativo',true,false,false,null,true,true),
  ('00000000-0000-4000-8002-000000000003','Carla Mendes','carla_mendes','carla_mendes@exemplo.test',37,'Hoenn','Cidade 3','1989-03-07','#2a9d8f','nao_binario','Treinador fictício para testes.','ativo',true,true,false,null,true,true),
  ('00000000-0000-4000-8002-000000000004','Diego Rocha','diego_rocha','diego_rocha@exemplo.test',35,'Sinnoh','Cidade 4','1991-04-08','#f4a261','prefiro_nao_informar','Treinador fictício para testes.','ativo',true,false,true,null,true,true),
  ('00000000-0000-4000-8002-000000000005','Elisa Prado','elisa_prado','elisa_prado@exemplo.test',33,'Unova','Cidade 5','1993-05-09','#6a4c93','feminino','Treinador fictício para testes.','ativo',true,true,false,null,true,true),
  ('00000000-0000-4000-8002-000000000006','Fábio Nunes','fabio_nunes','fabio_nunes@exemplo.test',31,'Kalos','Cidade 6','1995-06-10','#1d3557','masculino','Treinador fictício para testes.','inativo',true,false,false,null,true,true),
  ('00000000-0000-4000-8002-000000000007','Gabriela Alves','gabriela_alves','gabriela_alves@exemplo.test',29,'Alola','Cidade 7','1997-07-11','#8d99ae','nao_binario','Treinador fictício para testes.','ativo',true,true,true,null,true,true),
  ('00000000-0000-4000-8002-000000000008','Hugo Teixeira','hugo_teixeira','hugo_teixeira@exemplo.test',27,'Galar','Cidade 8','1999-08-12','#06d6a0','prefiro_nao_informar','Treinador fictício para testes.','ativo',true,false,false,null,true,true),
  ('00000000-0000-4000-8002-000000000009','Inês Carvalho','ines_carvalho','ines_carvalho@exemplo.test',25,'Paldea','Cidade 9','2001-09-13','#ef476f','feminino','Treinador fictício para testes.','ativo',true,true,false,null,true,true),
  ('00000000-0000-4000-8002-000000000010','João Pereira','joao_pereira','joao_pereira@exemplo.test',23,'Kanto','Cidade 10','2003-10-14','#ffb703','masculino','Treinador fictício para testes.','ativo',true,false,true,null,true,true)
  on conflict (id) do nothing;

  insert into pokemon_records (id,pokedex_number,name,nickname,primary_type,secondary_type,species,height_m,weight_kg,level,hp,attack,defense,sp_attack,sp_defense,speed,generation,status,rarity,captured_at,registered_at,is_favorite,notes,image_url,source,is_demo,is_seed) values
  ('00000000-0000-4000-8001-000000000001',1,'Bulbasaur','Bulbasaur Jr.','grass','poison','Espécie Bulbasaur',0.7,6.9,5,45,49,49,65,65,45,1,'ativo','comum','2025-01-01','2026-01-01T09:00:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000002',4,'Charmander',null,'fire',null,'Espécie Charmander',0.6,8.5,12,39,52,43,60,50,65,1,'ativo','comum','2025-02-04','2026-01-02T10:07:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000003',7,'Squirtle',null,'water',null,'Espécie Squirtle',0.5,9,19,44,48,65,50,64,43,1,'ativo','comum','2025-03-07','2026-01-03T11:14:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000004',25,'Pikachu','Pikachu Jr.','electric',null,'Espécie Pikachu',0.4,6,26,35,55,40,50,50,90,1,'inativo','incomum','2025-04-10','2026-01-04T12:21:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000005',39,'Jigglypuff',null,'normal','fairy','Espécie Jigglypuff',0.5,5.5,33,115,45,20,45,25,20,1,'arquivado','comum','2025-05-13','2026-01-05T13:28:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000006',54,'Psyduck',null,'water',null,'Espécie Psyduck',0.8,19.6,40,50,52,48,65,50,55,1,'ativo','comum','2025-06-16','2026-01-06T14:35:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000007',94,'Gengar','Gengar Jr.','ghost','poison','Espécie Gengar',1.5,40.5,47,60,65,60,130,75,110,1,'ativo','raro','2025-07-19','2026-01-07T15:42:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000008',130,'Gyarados',null,'water','flying','Espécie Gyarados',6.5,235,54,95,125,79,60,100,81,1,'ativo','raro','2025-08-22','2026-01-08T16:49:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000009',143,'Snorlax',null,'normal',null,'Espécie Snorlax',2.1,460,61,160,110,65,65,110,30,1,'inativo','raro','2025-09-25','2026-01-09T09:56:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000010',149,'Dragonite','Dragonite Jr.','dragon','flying','Espécie Dragonite',2.2,210,68,91,134,95,100,100,80,1,'arquivado','epico','2025-10-01','2026-01-10T10:03:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000011',150,'Mewtwo',null,'psychic',null,'Espécie Mewtwo',2,122,75,106,110,90,154,90,130,1,'ativo','lendario','2025-11-04','2026-01-11T11:10:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000012',152,'Chikorita',null,'grass',null,'Espécie Chikorita',0.9,6.4,82,45,49,65,49,65,45,2,'ativo','comum','2025-12-07','2026-01-12T12:17:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000013',158,'Totodile','Totodile Jr.','water',null,'Espécie Totodile',0.6,9.5,89,50,65,64,44,48,43,2,'ativo','comum','2025-01-10','2026-01-13T13:24:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000014',181,'Ampharos',null,'electric',null,'Espécie Ampharos',1.4,61.5,6,90,75,85,115,90,55,2,'inativo','incomum','2025-02-13','2026-01-14T14:31:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/181.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000015',196,'Espeon',null,'psychic',null,'Espécie Espeon',0.9,26.5,13,65,65,60,130,95,110,2,'arquivado','raro','2025-03-16','2026-01-15T15:38:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000016',248,'Tyranitar','Tyranitar Jr.','rock','dark','Espécie Tyranitar',2,202,20,100,134,110,95,100,61,2,'ativo','epico','2025-04-19','2026-01-16T16:45:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000017',249,'Lugia',null,'psychic','flying','Espécie Lugia',5.2,216,27,106,90,130,90,154,110,2,'ativo','lendario','2025-05-22','2026-01-17T09:52:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000018',252,'Treecko',null,'grass',null,'Espécie Treecko',0.5,5,34,40,45,35,65,55,70,3,'ativo','comum','2025-06-25','2026-01-18T10:59:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/252.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000019',258,'Mudkip','Mudkip Jr.','water',null,'Espécie Mudkip',0.4,7.6,41,50,70,50,50,50,40,3,'inativo','comum','2025-07-01','2026-01-19T11:06:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000020',282,'Gardevoir',null,'psychic','fairy','Espécie Gardevoir',1.6,48.4,48,68,65,65,125,115,80,3,'arquivado','raro','2025-08-04','2026-01-20T12:13:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/282.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000021',373,'Salamence',null,'dragon','flying','Espécie Salamence',1.5,102.6,55,95,135,80,110,80,100,3,'ativo','epico','2025-09-07','2026-01-21T13:20:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/373.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000022',384,'Rayquaza','Rayquaza Jr.','dragon','flying','Espécie Rayquaza',7,206.5,62,105,150,90,150,90,95,3,'ativo','lendario','2025-10-10','2026-01-22T14:27:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000023',387,'Turtwig',null,'grass',null,'Espécie Turtwig',0.4,10.2,69,55,68,64,45,55,31,4,'ativo','comum','2025-11-13','2026-01-23T15:34:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/387.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000024',448,'Lucario',null,'fighting','steel','Espécie Lucario',1.2,54,76,70,110,70,115,70,90,4,'inativo','raro','2025-12-16','2026-01-24T16:41:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000025',445,'Garchomp','Garchomp Jr.','dragon','ground','Espécie Garchomp',1.9,95,83,108,130,95,80,85,102,4,'arquivado','epico','2025-01-19','2026-01-25T09:48:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000026',495,'Snivy',null,'grass',null,'Espécie Snivy',0.6,8.1,90,45,45,55,45,55,63,5,'ativo','comum','2025-02-22','2026-01-26T10:55:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/495.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000027',571,'Zoroark',null,'dark',null,'Espécie Zoroark',1.6,81.1,7,60,105,60,120,60,105,5,'ativo','raro','2025-03-25','2026-01-27T11:02:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/571.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000028',658,'Greninja','Greninja Jr.','water','dark','Espécie Greninja',1.5,40,14,72,95,67,103,71,122,6,'ativo','epico','2025-04-01','2026-01-28T12:09:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png','pokeapi',true,true),
  ('00000000-0000-4000-8001-000000000029',700,'Sylveon',null,'fairy',null,'Espécie Sylveon',1,23.5,21,95,65,65,110,130,60,6,'inativo','incomum','2025-05-04','2026-01-29T13:16:00.000Z',true,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png','custom',true,true),
  ('00000000-0000-4000-8001-000000000030',724,'Decidueye',null,'grass','ghost','Espécie Decidueye',1.6,36.6,28,78,107,75,100,100,70,7,'arquivado','raro','2025-06-07','2026-01-30T14:23:00.000Z',false,'Registro fictício de demonstração.','https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/724.png','pokeapi',true,true)
  on conflict (id) do nothing;

  insert into teams (id,name,trainer_id,description,strategy,status,is_demo,is_seed) values
  ('00000000-0000-4000-8003-000000000001','Time Alfa','00000000-0000-4000-8002-000000000001','Equipe de demonstração Time Alfa','Estratégia equilibrada','ativo',true,true),
  ('00000000-0000-4000-8003-000000000002','Time Beta','00000000-0000-4000-8002-000000000002','Equipe de demonstração Time Beta','Estratégia equilibrada','ativo',true,true),
  ('00000000-0000-4000-8003-000000000003','Trovão Azul','00000000-0000-4000-8002-000000000003','Equipe de demonstração Trovão Azul','Estratégia equilibrada','ativo',true,true),
  ('00000000-0000-4000-8003-000000000004','Floresta Viva','00000000-0000-4000-8002-000000000004','Equipe de demonstração Floresta Viva','Estratégia equilibrada','ativo',true,true),
  ('00000000-0000-4000-8003-000000000005','Guardiões do Lago','00000000-0000-4000-8002-000000000005','Equipe de demonstração Guardiões do Lago','Estratégia equilibrada','inativo',true,true)
  on conflict (id) do nothing;

  insert into team_members (team_id,pokemon_id,slot) values
  ('00000000-0000-4000-8003-000000000001','00000000-0000-4000-8001-000000000001',1),
  ('00000000-0000-4000-8003-000000000001','00000000-0000-4000-8001-000000000002',2),
  ('00000000-0000-4000-8003-000000000001','00000000-0000-4000-8001-000000000003',3),
  ('00000000-0000-4000-8003-000000000002','00000000-0000-4000-8001-000000000006',1),
  ('00000000-0000-4000-8003-000000000002','00000000-0000-4000-8001-000000000007',2),
  ('00000000-0000-4000-8003-000000000002','00000000-0000-4000-8001-000000000008',3),
  ('00000000-0000-4000-8003-000000000002','00000000-0000-4000-8001-000000000009',4),
  ('00000000-0000-4000-8003-000000000003','00000000-0000-4000-8001-000000000011',1),
  ('00000000-0000-4000-8003-000000000003','00000000-0000-4000-8001-000000000012',2),
  ('00000000-0000-4000-8003-000000000003','00000000-0000-4000-8001-000000000013',3),
  ('00000000-0000-4000-8003-000000000003','00000000-0000-4000-8001-000000000014',4),
  ('00000000-0000-4000-8003-000000000003','00000000-0000-4000-8001-000000000015',5),
  ('00000000-0000-4000-8003-000000000004','00000000-0000-4000-8001-000000000016',1),
  ('00000000-0000-4000-8003-000000000004','00000000-0000-4000-8001-000000000017',2),
  ('00000000-0000-4000-8003-000000000004','00000000-0000-4000-8001-000000000018',3),
  ('00000000-0000-4000-8003-000000000004','00000000-0000-4000-8001-000000000019',4),
  ('00000000-0000-4000-8003-000000000004','00000000-0000-4000-8001-000000000020',5),
  ('00000000-0000-4000-8003-000000000004','00000000-0000-4000-8001-000000000021',6),
  ('00000000-0000-4000-8003-000000000005','00000000-0000-4000-8001-000000000021',1),
  ('00000000-0000-4000-8003-000000000005','00000000-0000-4000-8001-000000000022',2),
  ('00000000-0000-4000-8003-000000000005','00000000-0000-4000-8001-000000000023',3)
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
