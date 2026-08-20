-- CalendarioGym - migracion a planes semanales
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- Conserva ejercicios existentes, convierte week_start_date en planes,
-- migra rest_seconds a rest_minutes y actualiza RLS.

create extension if not exists pgcrypto;

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_plans_user_created_idx
  on public.workout_plans(user_id, created_at desc);

alter table public.exercises
  add column if not exists plan_id uuid references public.workout_plans(id) on delete cascade;

alter table public.exercises
  add column if not exists rest_minutes numeric(5, 2);

update public.exercises
set rest_minutes = round((rest_seconds::numeric / 60), 2)
where rest_minutes is null
  and rest_seconds is not null;

with source_weeks as (
  select distinct
    user_id,
    coalesce(week_start_date, created_at::date) as source_date
  from public.exercises
  where plan_id is null
),
created_plans as (
  insert into public.workout_plans (user_id, name, created_at, updated_at)
  select
    source_weeks.user_id,
    'Plan semanal ' || source_weeks.source_date::text,
    now(),
    now()
  from source_weeks
  where not exists (
    select 1
    from public.workout_plans existing
    where existing.user_id = source_weeks.user_id
      and existing.name = 'Plan semanal ' || source_weeks.source_date::text
  )
  returning id, user_id, name
)
update public.exercises
set plan_id = workout_plans.id
from public.workout_plans
where public.exercises.plan_id is null
  and workout_plans.user_id = public.exercises.user_id
  and workout_plans.name = 'Plan semanal ' ||
    coalesce(public.exercises.week_start_date, public.exercises.created_at::date)::text;

alter table public.exercises
  alter column plan_id set not null;

alter table public.exercises
  drop column if exists week_start_date;

alter table public.exercises
  drop column if exists rest_seconds;

create index if not exists exercises_plan_day_position_idx
  on public.exercises(plan_id, day_of_week, position);

drop index if exists exercises_user_week_day_position_idx;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workout_plans_updated_at on public.workout_plans;
create trigger set_workout_plans_updated_at
before update on public.workout_plans
for each row
execute function public.set_updated_at();

drop trigger if exists set_exercises_updated_at on public.exercises;
create trigger set_exercises_updated_at
before update on public.exercises
for each row
execute function public.set_updated_at();

alter table public.workout_plans enable row level security;
alter table public.exercises enable row level security;

drop policy if exists "Users can read their own workout plans" on public.workout_plans;
create policy "Users can read their own workout plans"
on public.workout_plans
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own workout plans" on public.workout_plans;
create policy "Users can create their own workout plans"
on public.workout_plans
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workout plans" on public.workout_plans;
create policy "Users can update their own workout plans"
on public.workout_plans
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own workout plans" on public.workout_plans;
create policy "Users can delete their own workout plans"
on public.workout_plans
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own exercises" on public.exercises;
create policy "Users can read their own exercises"
on public.exercises
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own exercises" on public.exercises;
create policy "Users can create their own exercises"
on public.exercises
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_plans
    where workout_plans.id = exercises.plan_id
      and workout_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own exercises" on public.exercises;
create policy "Users can update their own exercises"
on public.exercises
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_plans
    where workout_plans.id = exercises.plan_id
      and workout_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own exercises" on public.exercises;
create policy "Users can delete their own exercises"
on public.exercises
for delete
to authenticated
using (auth.uid() = user_id);
