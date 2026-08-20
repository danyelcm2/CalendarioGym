-- CalendarioGym - extras de planes
-- Ejecutar despues de la migracion a workout_plans.
-- Agrega color por plan y estado completado por ejercicio.

alter table public.workout_plans
  add column if not exists color text not null default 'teal';

alter table public.workout_plans
  drop constraint if exists workout_plans_color_chk;

alter table public.workout_plans
  add constraint workout_plans_color_chk
  check (color in ('blue', 'red', 'green', 'teal', 'purple', 'amber'));

alter table public.exercises
  add column if not exists completed boolean not null default false;
