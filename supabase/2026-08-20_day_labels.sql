-- CalendarioGym - nombres personalizados por dia
-- Ejecutar en Supabase SQL Editor.
--
-- Este script agrega los nombres visibles por dia dentro de cada plan.
-- Ejemplo:
-- {
--   "monday": "Pecho",
--   "tuesday": "Espalda"
-- }

alter table public.workout_plans
  add column if not exists day_labels jsonb not null default '{}'::jsonb;
