// lib/mgnrega.ts

// The only critical imports, which are safe due to getSupabase() wrapping:
import { getCache } from "@/lib/cache"; // Now points to the dummy file
import { getMetricsRow, getRecentTrend, upsertMetricsRow } from "@/lib/db";
import type { DistrictMonthMetrics, MetricCards } from "@/types/mgnrega";

const TTL_SECONDS = 60 * 60 * 24; // 1 day

function cacheKey(state: string, district: string, finYear: string, month: string) {
  return `mgnrega:${state}:${district}:${finYear}-${month}`;
}

// Helpers to convert month/year to DB format
function monthNumberToName(m: number) {
  return new Date(2000, m - 1, 1).toLocaleString("en-US", { month: "short" }); // Jan, Feb, ...
}

function getFinYear(month: number, year: number) {
  // MGNREGA financial year: Apr-Mar
  if (month >= 4) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

// ----------------------------------------------------------------------
// Safe Dummy Fallback Functions (Since you are only using Supabase)
// ----------------------------------------------------------------------

// 3) Fallback to data.gov.in - DUMMY IMPLEMENTATION
async function fetchFromDataGov(state: string, district: string, month: number, year: number) {
  // WARNING: This check prevents the original API from running, 
  // but it's now wrapped in the function, so it's safer.
  const apiKey = process.env.DATA_GOV_API_KEY; 
  const resource = process.env.DATA_GOV_RESOURCE_ID; 
  
  if (!apiKey || !resource) {
    // This warning is now harmless, as the function exits safely.
    console.warn("[mgnrega] External API call disabled due to missing keys.");
    return null; 
  }

  // If you *do* want to use the API later, uncomment the original fetch logic here.
  return null; 
}

function mapCards(record: any): MetricCards {
  // If the data is not fetched, this returns a zeroed-out object.
  return {
    persondays: firstNumber(record, ["persondays_generated"]),
    householdsWorked: firstNumber(record, ["no_of_households_worked"]),
    avgDaysPerHH: firstNumber(record, ["avg_days_per_household"]),
    wageExpenditure: firstNumber(record, ["wage_expenditure"]),
  };
}

// Utility functions
function monthNameToNumber(m: string) {
  const date = new Date(`${m} 1, 2000`);
  return date.getMonth() + 1;
}

function human(dateIso: string) {
  try {
    return new Date(dateIso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return dateIso;
  }
}

function safeNum(n: any) {
  if (n == null) return 0;
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function firstNumber(src: any, keys: string[]) {
  for (const k of keys) {
    if (k in (src || {})) {
      const n = Number(src[k]);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}


// ----------------------------------------------------------------------
// EXPORTED CORE LOGIC
// ----------------------------------------------------------------------

export async function getMetricsForDistrictMonth(
  state: string,
  district: string,
  monthNum: number,
  year: number
): Promise<DistrictMonthMetrics | null> {
  const month = monthNumberToName(monthNum);
  const finYear = getFinYear(monthNum, year);

  // 1) DB source of truth (Supabase)
  const dbRow = await getMetricsRow(state, district, finYear, month);
  if (dbRow) {
    const cards: MetricCards = {
      persondays: safeNum(dbRow.persondays_of_central_liability_so_far),
      householdsWorked: safeNum(dbRow.total_households_worked),
      avgDaysPerHH: safeNum(dbRow.avg_days_of_employment_per_household),
      wageExpenditure: safeNum(dbRow.wages),
      totalWorkers: safeNum(dbRow.total_workers),
      womenPersondays: safeNum(dbRow.women_persondays),
      avgWageRate: safeNum(dbRow.avg_wage_rate_per_day_per_person),
      numCompletedWorks: safeNum(dbRow.num_completed_works),
      numOngoingWorks: safeNum(dbRow.num_ongoing_works),
      scPersondays: safeNum(dbRow.sc_persondays),
      stPersondays: safeNum(dbRow.st_persondays),
      totalExpenditure: safeNum(dbRow.total_expenditure),
      totalAdminExpenditure: safeNum(dbRow.total_admin_expenditure),
      totalJobCardsIssued: safeNum(dbRow.total_job_cards_issued),
      totalActiveJobCards: safeNum(dbRow.total_active_job_cards),
      totalActiveWorkers: safeNum(dbRow.total_active_workers),
      totalWorksTakenup: safeNum(dbRow.total_works_takenup),
      totalHhsCompleted100Days: safeNum(dbRow.total_hhs_completed_100_days),
      materialAndSkilledWages: safeNum(dbRow.material_and_skilled_wages),
      differentlyAbledPersonsWorked: safeNum(dbRow.differently_abled_persons_worked),
      percentPaymentsWithin15Days: safeNum(dbRow.percent_payments_within_15_days),
      percentNrmExpenditure: safeNum(dbRow.percent_nrm_expenditure),
    };
    return {
      state, district, month: monthNum, year, cards, payload: dbRow.payload,
      stale: false, updatedAt: dbRow.updated_at, updatedAtHuman: human(dbRow.updated_at),
    };
  }

  // 2) Cache (Uses Dummy Cache, will return null)
  const cache = getCache();
  const cached = await cache.get(cacheKey(state, district, finYear, month));
  if (cached) return { ...cached, stale: true, updatedAtHuman: human(cached.updatedAt) };

  // 3) Fallback to external API (Uses Dummy function, will return null)
  const fetched = await fetchFromDataGov(state, district, monthNum, year);
  if (!fetched) return null; // Exit here as external data is unavailable

  // If execution reaches here (e.g., if you enable a real API later)
  const mappedCards = mapCards(fetched);
  const doc: DistrictMonthMetrics = {
    state, district, year, month: monthNum, cards: mappedCards,
    payload: fetched, stale: false, updatedAt: new Date().toISOString(),
    updatedAtHuman: human(new Date().toISOString()),
  };

  await Promise.allSettled([
    upsertMetricsRow({
      state_name: state, district_name: district, fin_year: finYear, month,
      payload: fetched, cards: mappedCards,
    }),
    cache.set(cacheKey(state, district, finYear, month), doc, TTL_SECONDS),
  ]);

  return doc;
}

export async function getTrendForDistrict(state: string, district: string, uptoYear: number, monthsBack: number) {
  const uptoMonth = new Date().getMonth() + 1;
  const finYear = getFinYear(uptoMonth, uptoYear);
  const monthName = monthNumberToName(uptoMonth);

  const rows = await getRecentTrend(state, district, monthsBack, finYear, monthName);

  return (rows || [])
    .map((r) => ({
      year: Number(r.year.split("-")[0]),
      month: monthNameToNumber(r.month),
      persondays: safeNum(r.persondays),
      householdsWorked: safeNum(r.householdsWorked),
      wageExpenditure: safeNum(r.wageExpenditure),
    }))
    .filter((r) => r.year && r.month)
    .sort((a, b) => a.year - b.year || a.month - b.month);
}
