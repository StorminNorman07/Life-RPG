create table if not exists public.premium_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  trial_started_at timestamptz,
  trial_expires_at timestamptz,
  premium_until timestamptz,
  premium_lifetime boolean not null default false,
  premium_source text,
  updated_at timestamptz not null default now()
);

create table if not exists public.premium_codes (
  code text primary key,
  duration_months integer,
  lifetime boolean not null default false,
  constraint premium_codes_valid_reward check (
    (lifetime and duration_months is null) or
    (not lifetime and duration_months > 0)
  )
);

insert into public.premium_codes (code, duration_months, lifetime)
values
  ('christmas', null, true),
  ('echoone', null, true),
  ('ryangoslingmemes', 1, false),
  ('ethanslifeyt', 1, false)
on conflict (code) do update
set duration_months = excluded.duration_months,
    lifetime = excluded.lifetime;

alter table public.premium_entitlements enable row level security;
alter table public.premium_codes enable row level security;

drop policy if exists "Users can view their own Premium entitlement"
  on public.premium_entitlements;
create policy "Users can view their own Premium entitlement"
  on public.premium_entitlements
  for select to authenticated
  using (auth.uid() = user_id);

revoke all on public.premium_entitlements from anon, authenticated;
grant select on public.premium_entitlements to authenticated;
revoke all on public.premium_codes from anon, authenticated;

create or replace function public.start_premium_trial()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  trial_start timestamptz := now();
  trial_end timestamptz := now() + interval '7 days';
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.premium_entitlements as current_entitlement (
    user_id,
    trial_started_at,
    trial_expires_at,
    premium_until,
    premium_source
  )
  values (
    current_user_id,
    trial_start,
    trial_end,
    trial_end,
    'trial'
  )
  on conflict (user_id) do update
  set trial_started_at = coalesce(
        current_entitlement.trial_started_at,
        excluded.trial_started_at
      ),
      trial_expires_at = coalesce(
        current_entitlement.trial_expires_at,
        excluded.trial_expires_at
      ),
      premium_until = case
        when current_entitlement.trial_started_at is null
          and not current_entitlement.premium_lifetime
          and (current_entitlement.premium_until is null
            or current_entitlement.premium_until < excluded.premium_until)
          then excluded.premium_until
        else current_entitlement.premium_until
      end,
      premium_source = case
        when current_entitlement.trial_started_at is null
          and (current_entitlement.premium_until is null
            or current_entitlement.premium_until <= now())
          then 'trial'
        else current_entitlement.premium_source
      end,
      updated_at = now();
end;
$$;

create or replace function public.redeem_premium_code(input_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  reward public.premium_codes%rowtype;
  entitlement public.premium_entitlements%rowtype;
  next_expiration timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into reward
  from public.premium_codes
  where code = lower(trim(coalesce(input_code, '')));

  if not found then
    raise exception 'Invalid Premium code';
  end if;

  perform public.start_premium_trial();

  select * into entitlement
  from public.premium_entitlements
  where user_id = current_user_id
  for update;

  if reward.lifetime then
    update public.premium_entitlements
    set premium_lifetime = true,
        premium_until = null,
        premium_source = 'code',
        updated_at = now()
    where user_id = current_user_id
    returning * into entitlement;
  else
    next_expiration := greatest(
      coalesce(entitlement.premium_until, now()),
      now()
    ) + make_interval(months => reward.duration_months);

    update public.premium_entitlements
    set premium_until = next_expiration,
        premium_lifetime = false,
        premium_source = 'code',
        updated_at = now()
    where user_id = current_user_id
    returning * into entitlement;
  end if;

  return jsonb_build_object(
    'is_premium', entitlement.premium_lifetime or entitlement.premium_until > now(),
    'is_lifetime', entitlement.premium_lifetime,
    'premium_until', entitlement.premium_until,
    'trial_started_at', entitlement.trial_started_at,
    'trial_expires_at', entitlement.trial_expires_at,
    'premium_source', entitlement.premium_source
  );
end;
$$;

revoke all on function public.start_premium_trial() from public, anon;
grant execute on function public.start_premium_trial() to authenticated;
revoke all on function public.redeem_premium_code(text) from public, anon;
grant execute on function public.redeem_premium_code(text) to authenticated;
