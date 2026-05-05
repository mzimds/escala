-- ═══════════════════════════════════════════════════════════
--  ESCALA — Schema Supabase
--  Execute este arquivo no SQL Editor do seu projeto Supabase
-- ═══════════════════════════════════════════════════════════

-- Habilitar extensão uuid
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────
--  HOSPITALS (um por organização)
-- ───────────────────────────────────────────
create table if not exists hospitals (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null default 'Meu Hospital',
  created_at  timestamptz default now()
);

-- ───────────────────────────────────────────
--  HOSPITAL MEMBERS (usuários de um hospital)
--  role: 'admin' | 'member'
-- ───────────────────────────────────────────
create table if not exists hospital_members (
  id           uuid primary key default uuid_generate_v4(),
  hospital_id  uuid not null references hospitals(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'admin' check (role in ('admin','member')),
  joined_at    timestamptz default now(),
  unique(hospital_id, user_id)
);

-- ───────────────────────────────────────────
--  SECTORS (setores do hospital)
-- ───────────────────────────────────────────
create table if not exists sectors (
  id           uuid primary key default uuid_generate_v4(),
  hospital_id  uuid not null references hospitals(id) on delete cascade,
  name         text not null,
  created_at   timestamptz default now()
);

-- ───────────────────────────────────────────
--  DOCTORS (profissionais)
-- ───────────────────────────────────────────
create table if not exists doctors (
  id           uuid primary key default uuid_generate_v4(),
  hospital_id  uuid not null references hospitals(id) on delete cascade,
  name         text not null,
  specialty    text not null default '',
  active       boolean not null default true,
  created_at   timestamptz default now()
);

-- ───────────────────────────────────────────
--  HOSPITAL CONFIG (por setor)
-- ───────────────────────────────────────────
create table if not exists hospital_config (
  id                        uuid primary key default uuid_generate_v4(),
  hospital_id               uuid not null references hospitals(id) on delete cascade,
  sector_id                 uuid references sectors(id) on delete cascade,
  considerar_quinta_semana  boolean not null default true,
  cobertura                 jsonb not null default '{"dia_util":{"manha":1,"tarde":1,"noite":1},"fim_semana":{"manha":1,"tarde":1,"noite":1}}',
  updated_at                timestamptz default now(),
  unique(hospital_id, sector_id)
);

-- ───────────────────────────────────────────
--  SCHEDULES (escalas mensais por setor)
-- ───────────────────────────────────────────
create table if not exists schedules (
  id               uuid primary key default uuid_generate_v4(),
  hospital_id      uuid not null references hospitals(id) on delete cascade,
  sector_id        uuid not null references sectors(id) on delete cascade,
  year             int not null,
  month            int not null check (month between 1 and 12),
  status           text not null default 'open' check (status in ('open','finalized')),
  values_config    jsonb not null default '{}',
  doctor_snapshot  jsonb,
  bonus            jsonb not null default '{}',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(hospital_id, sector_id, year, month)
);

-- ───────────────────────────────────────────
--  ALLOCATIONS (médico alocado em turno/dia)
-- ───────────────────────────────────────────
create table if not exists allocations (
  id           uuid primary key default uuid_generate_v4(),
  schedule_id  uuid not null references schedules(id) on delete cascade,
  doctor_id    uuid not null references doctors(id) on delete cascade,
  date         date not null,
  shift        text not null check (shift in ('manha','tarde','noite')),
  value        numeric(10,2) not null default 0,
  created_at   timestamptz default now()
);

-- ───────────────────────────────────────────
--  HOLIDAYS (feriados por escala)
-- ───────────────────────────────────────────
create table if not exists holidays (
  id           uuid primary key default uuid_generate_v4(),
  schedule_id  uuid not null references schedules(id) on delete cascade,
  date         date not null,
  name         text not null default '',
  unique(schedule_id, date)
);

-- ═══════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════

alter table hospitals          enable row level security;
alter table hospital_members   enable row level security;
alter table sectors            enable row level security;
alter table doctors            enable row level security;
alter table hospital_config    enable row level security;
alter table schedules          enable row level security;
alter table allocations        enable row level security;
alter table holidays           enable row level security;

-- Helper: retorna o hospital_id do usuário autenticado
create or replace function my_hospital_id()
returns uuid language sql security definer stable as $$
  select hospital_id from hospital_members
  where user_id = auth.uid()
  limit 1;
$$;

-- Hospitals: só membros veem seu hospital
create policy "members see own hospital" on hospitals
  for select using (id = my_hospital_id());

create policy "members update own hospital" on hospitals
  for update using (id = my_hospital_id());

-- Hospital members: só membros do mesmo hospital
create policy "members see own hospital_members" on hospital_members
  for select using (hospital_id = my_hospital_id());

create policy "members insert hospital_members" on hospital_members
  for insert with check (hospital_id = my_hospital_id());

-- Sectors
create policy "members crud sectors" on sectors
  for all using (hospital_id = my_hospital_id())
  with check (hospital_id = my_hospital_id());

-- Doctors
create policy "members crud doctors" on doctors
  for all using (hospital_id = my_hospital_id())
  with check (hospital_id = my_hospital_id());

-- Hospital config
create policy "members crud hospital_config" on hospital_config
  for all using (hospital_id = my_hospital_id())
  with check (hospital_id = my_hospital_id());

-- Schedules
create policy "members crud schedules" on schedules
  for all using (hospital_id = my_hospital_id())
  with check (hospital_id = my_hospital_id());

-- Allocations (via schedule)
create policy "members crud allocations" on allocations
  for all using (
    schedule_id in (select id from schedules where hospital_id = my_hospital_id())
  )
  with check (
    schedule_id in (select id from schedules where hospital_id = my_hospital_id())
  );

-- Holidays (via schedule)
create policy "members crud holidays" on holidays
  for all using (
    schedule_id in (select id from schedules where hospital_id = my_hospital_id())
  )
  with check (
    schedule_id in (select id from schedules where hospital_id = my_hospital_id())
  );

-- ═══════════════════════════════════════════
--  FUNÇÃO: cria hospital automaticamente no signup
-- ═══════════════════════════════════════════
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_hospital_id uuid;
  new_sector_id uuid;
begin
  -- Cria hospital
  insert into hospitals(name) values('Meu Hospital')
  returning id into new_hospital_id;

  -- Cria setor padrão
  insert into sectors(hospital_id, name) values(new_hospital_id, 'Geral')
  returning id into new_sector_id;

  -- Vincula o usuário como admin
  insert into hospital_members(hospital_id, user_id, role)
  values(new_hospital_id, new.id, 'admin');

  -- Config padrão do setor
  insert into hospital_config(hospital_id, sector_id)
  values(new_hospital_id, new_sector_id);

  return new;
end;
$$;

-- Trigger que roda após cada novo signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
