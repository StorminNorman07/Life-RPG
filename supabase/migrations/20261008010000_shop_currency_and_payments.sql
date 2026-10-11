alter table public.premium_entitlements
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_until timestamptz;

create table if not exists public.shop_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  coin_balance integer not null default 0 check (coin_balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_coin_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  transaction_type text not null check (transaction_type in ('progression', 'cosmetic_purchase', 'coin_pack')),
  source_id text not null,
  amount integer not null check (amount <> 0),
  created_at timestamptz not null default now(),
  unique (user_id, transaction_type, source_id)
);

create table if not exists public.shop_progression_claims (
  user_id uuid not null references auth.users (id) on delete cascade,
  level integer not null check (level between 1 and 99),
  coin_reward integer not null check (coin_reward > 0),
  claimed_at timestamptz not null default now(),
  primary key (user_id, level)
);

create table if not exists public.shop_cosmetic_catalog (
  cosmetic_id text primary key,
  required_level integer not null check (required_level between 1 and 99),
  coin_cost integer not null check (coin_cost > 0),
  active boolean not null default true
);

insert into public.shop_cosmetic_catalog (cosmetic_id, required_level, coin_cost)
values
  ('silver-outfit-2', 11, 75),
  ('gold-aura-2', 27, 125),
  ('platinum-heldItem-2', 41, 225),
  ('diamond-sceneEffect-2', 57, 300),
  ('master-accessory-2', 70, 400),
  ('legendary-sceneEffect-2', 91, 550)
on conflict (cosmetic_id) do update
set required_level = excluded.required_level,
    coin_cost = excluded.coin_cost,
    active = true;

create table if not exists public.shop_owned_cosmetics (
  user_id uuid not null references auth.users (id) on delete cascade,
  cosmetic_id text not null references public.shop_cosmetic_catalog (cosmetic_id),
  coin_cost integer not null,
  purchased_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);

create table if not exists public.shop_payment_grants (
  checkout_session_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_key text not null,
  granted_at timestamptz not null default now()
);

alter table public.shop_wallets enable row level security;
alter table public.shop_coin_ledger enable row level security;
alter table public.shop_progression_claims enable row level security;
alter table public.shop_cosmetic_catalog enable row level security;
alter table public.shop_owned_cosmetics enable row level security;
alter table public.shop_payment_grants enable row level security;

revoke all on public.shop_wallets from anon, authenticated;
revoke all on public.shop_coin_ledger from anon, authenticated;
revoke all on public.shop_progression_claims from anon, authenticated;
revoke all on public.shop_cosmetic_catalog from anon, authenticated;
revoke all on public.shop_owned_cosmetics from anon, authenticated;
revoke all on public.shop_payment_grants from anon, authenticated;

create or replace function public.claim_shop_progression_rewards()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_level integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select least(99, greatest(1, coalesce(level, 1)))
  into current_level
  from public.profiles
  where id = current_user_id;

  if current_level is null then
    current_level := 1;
  end if;

  with claimed as (
    insert into public.shop_progression_claims (user_id, level, coin_reward)
    select
      current_user_id,
      levels.level,
      case levels.level
        when 1 then 40
        when 10 then 50
        when 21 then 60
        when 34 then 70
        when 49 then 80
        when 66 then 80
        when 83 then 80
        else 10
      end
    from pg_catalog.generate_series(1, current_level) as levels(level)
    on conflict (user_id, level) do nothing
    returning user_id, level, coin_reward
  ), ledgered as (
    insert into public.shop_coin_ledger (user_id, transaction_type, source_id, amount)
    select user_id, 'progression', level::text, coin_reward
    from claimed
    on conflict (user_id, transaction_type, source_id) do nothing
    returning id
  )
  insert into public.shop_wallets as wallet (user_id, coin_balance)
  select current_user_id, coalesce(sum(coin_reward), 0)::integer
  from claimed
  on conflict (user_id) do update
  set coin_balance = wallet.coin_balance + excluded.coin_balance,
      updated_at = now();
end;
$$;

create or replace function public.get_shop_wallet_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_balance integer;
  current_level integer;
  owned_ids jsonb;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.claim_shop_progression_rewards();

  select least(99, greatest(1, coalesce(level, 1)))
  into current_level
  from public.profiles
  where id = current_user_id;

  select coin_balance
  into current_balance
  from public.shop_wallets
  where user_id = current_user_id;

  select coalesce(jsonb_agg(cosmetic_id order by cosmetic_id), '[]'::jsonb)
  into owned_ids
  from public.shop_owned_cosmetics
  where user_id = current_user_id;

  return jsonb_build_object(
    'coinBalance', coalesce(current_balance, 0),
    'ownedCosmeticIds', coalesce(owned_ids, '[]'::jsonb),
    'level', coalesce(current_level, 1)
  );
end;
$$;

create or replace function public.purchase_shop_cosmetic(input_cosmetic_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_level integer;
  cosmetic public.shop_cosmetic_catalog%rowtype;
  current_balance integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.claim_shop_progression_rewards();

  select * into cosmetic
  from public.shop_cosmetic_catalog
  where cosmetic_id = input_cosmetic_id
    and active;

  if not found then
    raise exception 'Cosmetic is not available in the shop';
  end if;

  select least(99, greatest(1, coalesce(level, 1)))
  into current_level
  from public.profiles
  where id = current_user_id;

  if coalesce(current_level, 1) >= cosmetic.required_level then
    raise exception 'This cosmetic is already unlocked through progression';
  end if;

  insert into public.shop_wallets (user_id, coin_balance)
  values (current_user_id, 0)
  on conflict (user_id) do nothing;

  select coin_balance into current_balance
  from public.shop_wallets
  where user_id = current_user_id
  for update;

  if exists (
    select 1 from public.shop_owned_cosmetics
    where user_id = current_user_id
      and cosmetic_id = input_cosmetic_id
  ) then
    raise exception 'You already own this cosmetic';
  end if;

  if current_balance < cosmetic.coin_cost then
    raise exception 'Not enough coins';
  end if;

  update public.shop_wallets
  set coin_balance = coin_balance - cosmetic.coin_cost,
      updated_at = now()
  where user_id = current_user_id
  returning coin_balance into current_balance;

  insert into public.shop_owned_cosmetics (user_id, cosmetic_id, coin_cost)
  values (current_user_id, input_cosmetic_id, cosmetic.coin_cost);

  insert into public.shop_coin_ledger (user_id, transaction_type, source_id, amount)
  values (current_user_id, 'cosmetic_purchase', input_cosmetic_id, -cosmetic.coin_cost);

  return jsonb_build_object(
    'coinBalance', current_balance,
    'cosmeticId', input_cosmetic_id
  );
end;
$$;

create or replace function public.grant_shop_coin_pack(
  input_user_id uuid,
  input_coin_amount integer,
  input_checkout_session_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if input_user_id is null
    or input_coin_amount not in (50, 800, 2000)
    or input_checkout_session_id is null
    or length(input_checkout_session_id) < 10 then
    raise exception 'Invalid coin pack grant';
  end if;

  if exists (
    select 1 from public.shop_payment_grants
    where checkout_session_id = input_checkout_session_id
  ) then
    return;
  end if;

  insert into public.shop_payment_grants (checkout_session_id, user_id, product_key)
  values (input_checkout_session_id, input_user_id, 'coins_' || input_coin_amount::text)
  on conflict (checkout_session_id) do nothing;

  if not found then
    return;
  end if;

  insert into public.shop_coin_ledger (user_id, transaction_type, source_id, amount)
  values (input_user_id, 'coin_pack', input_checkout_session_id, input_coin_amount);

  insert into public.shop_wallets as wallet (user_id, coin_balance)
  values (input_user_id, input_coin_amount)
  on conflict (user_id) do update
  set coin_balance = wallet.coin_balance + excluded.coin_balance,
      updated_at = now();
end;
$$;

create or replace function public.apply_premium_checkout(
  input_user_id uuid,
  input_product_key text,
  input_checkout_session_id text,
  input_customer_id text,
  input_subscription_id text,
  input_subscription_until timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if input_user_id is null
    or input_product_key not in ('premium_monthly', 'premium_yearly', 'premium_lifetime')
    or input_checkout_session_id is null then
    raise exception 'Invalid Premium grant';
  end if;

  insert into public.shop_payment_grants (checkout_session_id, user_id, product_key)
  values (input_checkout_session_id, input_user_id, input_product_key)
  on conflict (checkout_session_id) do nothing;

  if not found then
    return;
  end if;

  if input_product_key = 'premium_lifetime' then
    update public.premium_entitlements
    set premium_lifetime = true,
        premium_until = null,
        premium_source = 'stripe',
        stripe_customer_id = coalesce(input_customer_id, stripe_customer_id),
        updated_at = now()
    where user_id = input_user_id;
  else
    update public.premium_entitlements
    set stripe_customer_id = coalesce(input_customer_id, stripe_customer_id),
        stripe_subscription_id = input_subscription_id,
        stripe_subscription_until = input_subscription_until,
        premium_source = 'stripe',
        updated_at = now()
    where user_id = input_user_id;
  end if;
end;
$$;

create or replace function public.sync_premium_subscription(
  input_user_id uuid,
  input_subscription_id text,
  input_customer_id text,
  input_subscription_until timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if input_user_id is null or input_subscription_id is null then
    return;
  end if;

  update public.premium_entitlements
  set stripe_customer_id = coalesce(input_customer_id, stripe_customer_id),
      stripe_subscription_id = case
        when input_subscription_until is null or input_subscription_until <= now() then null
        else input_subscription_id
      end,
      stripe_subscription_until = input_subscription_until,
      updated_at = now()
  where user_id = input_user_id
    and (stripe_subscription_id is null or stripe_subscription_id = input_subscription_id);
end;
$$;

revoke all on function public.claim_shop_progression_rewards() from public, anon;
grant execute on function public.claim_shop_progression_rewards() to authenticated;
revoke all on function public.get_shop_wallet_status() from public, anon;
grant execute on function public.get_shop_wallet_status() to authenticated;
revoke all on function public.purchase_shop_cosmetic(text) from public, anon;
grant execute on function public.purchase_shop_cosmetic(text) to authenticated;
revoke all on function public.grant_shop_coin_pack(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.grant_shop_coin_pack(uuid, integer, text) to service_role;
revoke all on function public.apply_premium_checkout(uuid, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.apply_premium_checkout(uuid, text, text, text, text, timestamptz) to service_role;
revoke all on function public.sync_premium_subscription(uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.sync_premium_subscription(uuid, text, text, timestamptz) to service_role;
