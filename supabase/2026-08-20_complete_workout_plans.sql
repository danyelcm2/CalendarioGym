-- CalendarioGym - migracion completa a planes semanales
-- Ejecutar una sola vez en el SQL Editor de Supabase.
--
-- Incluye:
-- - workout_plans
-- - color por plan
-- - nombres personalizados por dia
-- - exercises.plan_id
-- - exercises.rest_minutes
-- - exercises.completed
-- - conversion de week_start_date a planes
-- - conversion de rest_seconds a rest_minutes
-- - triggers updated_at
-- - RLS y policies

create extension if not exists pgcrypto;

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default 'teal',
  day_labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workout_plans
  add column if not exists color text not null default 'teal';

alter table public.workout_plans
  add column if not exists day_labels jsonb not null default '{}'::jsonb;

alter table public.workout_plans
  drop constraint if exists workout_plans_color_chk;

alter table public.workout_plans
  add constraint workout_plans_color_chk
  check (color in ('blue', 'red', 'green', 'teal', 'purple', 'amber'));

create index if not exists workout_plans_user_created_idx
  on public.workout_plans(user_id, created_at desc);

alter table public.exercises
  add column if not exists plan_id uuid references public.workout_plans(id) on delete cascade;

alter table public.exercises
  add column if not exists rest_minutes numeric(5, 2);

alter table public.exercises
  add column if not exists completed boolean not null default false;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exercises'
      and column_name = 'rest_seconds'
  ) then
    update public.exercises
    set rest_minutes = round((rest_seconds::numeric / 60), 2)
    where rest_minutes is null
      and rest_seconds is not null;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exercises'
      and column_name = 'week_start_date'
  ) then
    insert into public.workout_plans (user_id, name, created_at, updated_at)
    select distinct
      exercises.user_id,
      'Plan semanal ' || coalesce(exercises.week_start_date, exercises.created_at::date)::text,
      now(),
      now()
    from public.exercises
    where exercises.plan_id is null
      and not exists (
        select 1
        from public.workout_plans existing
        where existing.user_id = exercises.user_id
          and existing.name =
            'Plan semanal ' || coalesce(exercises.week_start_date, exercises.created_at::date)::text
      );

    update public.exercises
    set plan_id = workout_plans.id
    from public.workout_plans
    where public.exercises.plan_id is null
      and workout_plans.user_id = public.exercises.user_id
      and workout_plans.name =
        'Plan semanal ' || coalesce(public.exercises.week_start_date, public.exercises.created_at::date)::text;
  end if;
end;
$$;

do $$
declare
  user_record record;
  new_plan_id uuid;
begin
  for user_record in
    select distinct user_id
    from public.exercises
    where plan_id is null
  loop
    insert into public.workout_plans (user_id, name, color)
    values (user_record.user_id, 'Entrenamiento actual', 'teal')
    returning id into new_plan_id;

    update public.exercises
    set plan_id = new_plan_id
    where user_id = user_record.user_id
      and plan_id is null;
  end loop;
end;
$$;

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
