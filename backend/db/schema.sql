-- PCSensei production schema (PostgreSQL / Supabase)
-- Run in a migration tool or Supabase SQL editor.

create extension if not exists pgcrypto;

create type component_category as enum (
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'case',
  'cooling',
  'laptop'
);

create table if not exists components (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  category component_category not null,
  name text not null,
  brand text,
  chipset text,
  socket text,
  memory_type text,
  tdp_watts int,
  vram_gb int,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_components_category on components(category);
create index if not exists idx_components_socket on components(socket);
create index if not exists idx_components_name on components using gin (to_tsvector('simple', name));

create table if not exists component_prices (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references components(id) on delete cascade,
  store_code text not null,
  store_name text not null,
  product_url text not null,
  price_inr numeric(12,2) not null check (price_inr >= 0),
  currency text not null default 'INR',
  in_stock boolean not null default true,
  fetched_at timestamptz not null default now()
);

create unique index if not exists idx_component_prices_unique
  on component_prices(component_id, store_code, fetched_at);
create index if not exists idx_component_prices_latest
  on component_prices(component_id, store_code, fetched_at desc);

create table if not exists fps_benchmarks (
  id uuid primary key default gen_random_uuid(),
  game_name text not null,
  resolution text not null,
  quality text not null,
  gpu_tier text not null,
  baseline_fps numeric(8,2) not null check (baseline_fps >= 0),
  source text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_fps_benchmarks_unique
  on fps_benchmarks(game_name, resolution, quality, gpu_tier);

create table if not exists compatibility_rules (
  id uuid primary key default gen_random_uuid(),
  rule_code text unique not null,
  description text not null,
  severity text not null check (severity in ('error', 'warning', 'info')),
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users_profile (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists builds (
  id uuid primary key default gen_random_uuid(),
  share_slug text unique not null,
  user_id uuid references users_profile(id) on delete set null,
  budget_inr int not null check (budget_inr > 0),
  use_case text not null,
  resolution_target text not null,
  performance_goal text,
  compatibility_ok boolean not null default true,
  performance_score int not null default 0,
  total_price_inr int not null default 0,
  build_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_builds_user_created on builds(user_id, created_at desc);
create index if not exists idx_builds_created on builds(created_at desc);

create table if not exists build_items (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references builds(id) on delete cascade,
  component_id uuid references components(id) on delete set null,
  category component_category not null,
  component_name text not null,
  locked boolean not null default false
);

create index if not exists idx_build_items_build on build_items(build_id);

create table if not exists price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users_profile(id) on delete cascade,
  component_id uuid not null references components(id) on delete cascade,
  target_price_inr numeric(12,2) not null check (target_price_inr > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

