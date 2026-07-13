create extension if not exists pgcrypto;

create type publication_state as enum (
  'draft',
  'quant_reviewed',
  'compliance_reviewed',
  'published',
  'retired',
  'archived'
);

create type review_role as enum (
  'admin',
  'quant_reviewer',
  'compliance_reviewer',
  'publisher',
  'read_only'
);

create table instruments (
  id uuid primary key default gen_random_uuid(),
  ticker text not null unique,
  name text not null,
  exchange text not null,
  asset_class text not null,
  category text not null,
  data_rights_status text not null default 'prototype_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table strategy_families (
  id uuid primary key default gen_random_uuid(),
  family_id text not null unique,
  name text not null,
  methodology_summary text not null,
  created_at timestamptz not null default now()
);

create table strategy_variants (
  id uuid primary key default gen_random_uuid(),
  variant_id text not null unique,
  family_id uuid not null references strategy_families(id),
  slug text not null unique,
  status text not null default 'research',
  risk_band text not null,
  approved_benchmarks text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table research_artifacts (
  id uuid primary key default gen_random_uuid(),
  artifact_id text not null unique,
  artifact_hash text not null unique,
  schema_version text not null,
  publication_state publication_state not null default 'draft',
  instrument_id uuid not null references instruments(id),
  strategy_variant_id uuid not null references strategy_variants(id),
  data_snapshot_id text not null,
  methodology_version_id text not null,
  disclosure_version_id text not null,
  object_path text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  retired_at timestamptz,
  constraint research_artifacts_hash_format check (artifact_hash ~ '^sha256:[a-f0-9]{64}$')
);

create table content_reviews (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references research_artifacts(id) on delete cascade,
  stage publication_state not null,
  quant_reviewer uuid,
  compliance_reviewer uuid,
  approved_at timestamptz,
  review_notes text not null default '',
  created_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null,
  role review_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table waitlist_interest (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  interest text not null,
  source_page text not null,
  consent_disclosure_version text not null,
  created_at timestamptz not null default now(),
  unique (email, interest)
);

create table audit_log_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table instruments enable row level security;
alter table strategy_families enable row level security;
alter table strategy_variants enable row level security;
alter table research_artifacts enable row level security;
alter table content_reviews enable row level security;
alter table user_roles enable row level security;
alter table waitlist_interest enable row level security;
alter table audit_log_events enable row level security;

create policy "published artifacts are publicly readable"
on research_artifacts for select
using (publication_state = 'published');

create policy "published instruments are publicly readable"
on instruments for select
using (
  exists (
    select 1
    from research_artifacts
    where research_artifacts.instrument_id = instruments.id
      and research_artifacts.publication_state = 'published'
  )
);

create policy "published strategy families are publicly readable"
on strategy_families for select
using (
  exists (
    select 1
    from strategy_variants
    join research_artifacts on research_artifacts.strategy_variant_id = strategy_variants.id
    where strategy_variants.family_id = strategy_families.id
      and research_artifacts.publication_state = 'published'
  )
);

create policy "published strategy variants are publicly readable"
on strategy_variants for select
using (
  exists (
    select 1
    from research_artifacts
    where research_artifacts.strategy_variant_id = strategy_variants.id
      and research_artifacts.publication_state = 'published'
  )
);

create index research_artifacts_publication_state_idx
  on research_artifacts(publication_state);

create index research_artifacts_strategy_variant_idx
  on research_artifacts(strategy_variant_id);

create index audit_log_events_entity_idx
  on audit_log_events(entity_type, entity_id, created_at desc);
