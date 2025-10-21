create table if not exists mgnrega_metrics (
  id bigserial primary key,

  -- Identifiers
  fin_year text not null,
  month text not null check (length(month) > 0),
  state_code int not null,
  state_name text not null,
  district_code int not null,
  district_name text not null,

  -- Core metrics
  approved_labour_budget numeric default 0,
  avg_wage_rate_per_day_per_person numeric default 0,
  avg_days_of_employment_per_household numeric default 0,
  differently_abled_persons_worked numeric default 0,
  material_and_skilled_wages numeric default 0,
  num_completed_works numeric default 0,
  num_gps_with_nil_exp numeric default 0,
  num_ongoing_works numeric default 0,
  persondays_of_central_liability_so_far numeric default 0,
  sc_persondays numeric default 0,
  sc_workers_against_active_workers numeric default 0,
  st_persondays numeric default 0,
  st_workers_against_active_workers numeric default 0,
  total_admin_expenditure numeric default 0,
  total_expenditure numeric default 0,
  total_households_worked numeric default 0,
  total_individuals_worked numeric default 0,
  total_active_job_cards numeric default 0,
  total_active_workers numeric default 0,
  total_hhs_completed_100_days numeric default 0,
  total_job_cards_issued numeric default 0,
  total_workers numeric default 0,
  total_works_takenup numeric default 0,
  wages numeric default 0,
  women_persondays numeric default 0,
  percent_category_b_works numeric default 0,
  percent_expenditure_agri_allied numeric default 0,
  percent_nrm_expenditure numeric default 0,
  percent_payments_within_15_days numeric default 0,

  remarks text default 'NA',

  -- Store full raw payload for reference
  payload jsonb not null,

  -- Timestamps
  updated_at timestamptz not null default now(),

  -- Unique constraint to avoid duplicates
  unique (state_name, district_name, fin_year, month)
);

-- Index to speed up filtering by year, state, and district
create index if not exists idx_metrics_state_district_year 
on mgnrega_metrics (state_name, district_name, fin_year);
