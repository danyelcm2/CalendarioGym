-- CalendarioGym - dropset por ejercicio
-- Ejecutar en Supabase SQL Editor.
--
-- Permite marcar un ejercicio como dropset y guardar las repeticiones/peso
-- del tramo que se hace inmediatamente despues de la serie principal.

alter table public.exercises
  add column if not exists dropset_enabled boolean not null default false;

alter table public.exercises
  add column if not exists dropset_reps text;

alter table public.exercises
  add column if not exists dropset_weight text;
