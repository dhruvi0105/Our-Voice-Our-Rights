// lib/db.ts
import { createClient } from "@supabase/supabase-js";
import type { DistrictMonthMetrics, MetricCards } from "@/types/mgnrega";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -----------------------------
// Upsert a metrics row
// -----------------------------
export async function upsertMetricsRow(params: {
  state_name: string;
  district_name: string;
  fin_year: string; // e.g., "2024-2025"
  month: string;    // e.g., "Dec"
  payload: any;
  cards: MetricCards;
}) {
  const { state_name, district_name, fin_year, month, payload, cards } = params;

  const { data, error } = await supabase
    .from("mgnrega_metrics")
    .upsert(
      {
        state_name,
        district_name,
        fin_year,
        month,
        payload,
        persondays_of_central_liability_so_far: cards.persondays,
        total_households_worked: cards.householdsWorked,
        avg_days_of_employment_per_household: cards.avgDaysPerHH,
        wages: cards.wageExpenditure,
        updated_at: new Date().toISOString(),
      },
      { onConflict: ["state_name", "district_name", "fin_year", "month"] }
    );

  if (error) console.error("Upsert error:", error);
  return data;
}

// -----------------------------
// Fetch a single metrics row
// -----------------------------
export async function getMetricsRow(
  state_name: string,
  district_name: string,
  fin_year: string,
  month: string
) {
  const { data, error } = await supabase
    .from("mgnrega_metrics")
    .select("*")
    .eq("state_name", state_name)
    .eq("district_name", district_name)
    .eq("fin_year", fin_year)
    .eq("month", month)
    .maybeSingle(); // <-- changed from single()

  if (error) console.error("Fetch error:", error);
  return data;
}

// -----------------------------
// Fetch recent trend (last N months)
// -----------------------------
export async function getRecentTrend(
  state_name: string,
  district_name: string,
  months: number,
  uptoFinYear: string,
  uptoMonth: string
) {
  const { data, error } = await supabase
    .from("mgnrega_metrics")
    .select(
      "fin_year, month, persondays_of_central_liability_so_far, total_households_worked, avg_days_of_employment_per_household, wages, updated_at"
    )
    .eq("state_name", state_name)
    .eq("district_name", district_name)
    .lte("fin_year", uptoFinYear)
    .lte("month", uptoMonth)
    .order("fin_year", { ascending: false })
    .order("month", { ascending: false })
    .limit(months);

  if (error) {
    console.error("Trend fetch error:", error);
    return [];
  }

  // Map to uniform structure with safe defaults
  return (data || []).map((d: any) => ({
    year: d.fin_year,
    month: d.month,
    persondays: d.persondays_of_central_liability_so_far || 0,
    householdsWorked: d.total_households_worked || 0,
    avgDaysPerHH: d.avg_days_of_employment_per_household || 0,
    wageExpenditure: d.wages || 0,
    updatedAt: d.updated_at,
  }));
}
