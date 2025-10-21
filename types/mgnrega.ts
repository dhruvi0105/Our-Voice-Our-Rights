export type MetricCards = {
  persondays: number
  householdsWorked: number
  avgDaysPerHH: number
  wageExpenditure: number
}

export type DistrictMonthMetrics = {
  id: number
  fin_year: string
  month: string
  state_code: number
  state_name: string
  district_code: number
  district_name: string
  approved_labour_budget: number
  avg_wage_rate_per_day_per_person: number
  avg_days_of_employment_per_household: number
  differently_abled_persons_worked: number
  material_and_skilled_wages: number
  num_completed_works: number
  num_gps_with_nil_exp: number
  num_ongoing_works: number
  persondays_of_central_liability_so_far: number
  sc_persondays: number
  sc_workers_against_active_workers: number
  st_persondays: number
  st_workers_against_active_workers: number
  total_admin_expenditure: number
  total_expenditure: number
  total_households_worked: number
  total_individuals_worked: number
  total_active_job_cards: number
  total_active_workers: number
  total_hhs_completed_100_days: number
  total_job_cards_issued: number
  total_workers: number
  total_works_takenup: number
  wages: number
  women_persondays: number
  percent_category_b_works: number
  percent_expenditure_agri_allied: number
  percent_nrm_expenditure: number
  percent_payments_within_15_days: number
  remarks: string
  payload: any
  updated_at: string
}
