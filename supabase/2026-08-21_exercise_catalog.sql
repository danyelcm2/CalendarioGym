-- CalendarioGym - catalogo base de ejercicios
-- Ejecutar en Supabase SQL Editor.
--
-- Crea la tabla publica de catalogo que alimenta el desplegable del formulario.
-- Los usuarios pueden seleccionar del catalogo o escribir un ejercicio libre.

create extension if not exists pgcrypto;

create table if not exists public.exercise_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'strength',
  created_at timestamptz not null default now(),
  constraint exercise_catalog_category_chk check (category in ('strength', 'cardio'))
);

alter table public.exercise_catalog enable row level security;

drop policy if exists "Authenticated users can read exercise catalog"
on public.exercise_catalog;

create policy "Authenticated users can read exercise catalog"
on public.exercise_catalog
for select
to authenticated
using (true);

insert into public.exercise_catalog (name, category)
values
  ('Aductora', 'strength'),
  ('Aperturas en polea', 'strength'),
  ('Bicicleta estatica', 'cardio'),
  ('Caminadora', 'cardio'),
  ('Crucifijo inverso', 'strength'),
  ('Crunch en polea', 'strength'),
  ('Desarrollo de hombros', 'strength'),
  ('Dominadas', 'strength'),
  ('Elevacion frontal', 'strength'),
  ('Elevacion lateral', 'strength'),
  ('Eliptica', 'cardio'),
  ('Escaladora', 'cardio'),
  ('Extension de triceps', 'strength'),
  ('Fly', 'strength'),
  ('Hack en cuclillas', 'strength'),
  ('Hip thrust', 'strength'),
  ('Jalon al pecho', 'strength'),
  ('Mesa flexora', 'strength'),
  ('Peso muerto rumano', 'strength'),
  ('Plancha', 'strength'),
  ('Prensa de pierna', 'strength'),
  ('Prensa de piernas', 'strength'),
  ('Press banca', 'strength'),
  ('Press de banca', 'strength'),
  ('Press de banca inclinado', 'strength'),
  ('Press inclinado con mancuernas', 'strength'),
  ('Press militar', 'strength'),
  ('Remada abierta', 'strength'),
  ('Remada curvada', 'strength'),
  ('Remo con barra', 'strength'),
  ('Remo en maquina', 'strength'),
  ('Rosca directa', 'strength'),
  ('Rosca martillo', 'strength'),
  ('Rosca Scott', 'strength'),
  ('Silla extensora', 'strength'),
  ('Silla flexora', 'strength'),
  ('Sentadilla', 'strength'),
  ('Tirada abierta', 'strength'),
  ('Triceps cuerda', 'strength'),
  ('Triceps frances', 'strength'),
  ('Triceps frente', 'strength')
on conflict (name) do update
set category = excluded.category;
