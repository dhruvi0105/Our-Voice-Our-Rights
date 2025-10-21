import { getCache } from "@/lib/cache";
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

export async function getMetricsForDistrictMonth(
  state: string,
  district: string,
  monthNum: number,
  year: number
): Promise<DistrictMonthMetrics | null> {
  const month = monthNumberToName(monthNum);
  const finYear = getFinYear(monthNum, year);

  // 1) DB source of truth
  const dbRow = await getMetricsRow(state, district, finYear, month);
  if (dbRow) {
const cards = {
  persondays: safeNum(dbRow.persondays_of_central_liability_so_far),
  householdsWorked: safeNum(dbRow.total_households_worked),
  avgDaysPerHH: safeNum(dbRow.avg_days_of_employment_per_household),
  wageExpenditure: safeNum(dbRow.wages),

  // Additional important fields
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

  // A few bonus insights
  percentPaymentsWithin15Days: safeNum(dbRow.percent_payments_within_15_days),
  percentNrmExpenditure: safeNum(dbRow.percent_nrm_expenditure),
};
    return {
      state,
      district,
      month: monthNum,
      year,
      cards,
      payload: dbRow.payload,
      stale: false,
      updatedAt: dbRow.updated_at,
      updatedAtHuman: human(dbRow.updated_at),
    };
  }

  // 2) Upstash cache
  const cache = getCache();
  const cached = await cache.get(cacheKey(state, district, finYear, month));
  if (cached) return { ...cached, stale: true, updatedAtHuman: human(cached.updatedAt) };

  // 3) Fallback to data.gov.in
  const fetched = await fetchFromDataGov(state, district, monthNum, year);
  if (!fetched) return null;

  const mappedCards = mapCards(fetched);
  const doc: DistrictMonthMetrics = {
    state,
    district,
    year,
    month: monthNum,
    cards: mappedCards,
    payload: fetched,
    stale: false,
    updatedAt: new Date().toISOString(),
    updatedAtHuman: human(new Date().toISOString()),
  };

  await Promise.allSettled([
    upsertMetricsRow({
      state_name: state,
      district_name: district,
      fin_year: finYear,
      month,
      payload: fetched,
      cards: mappedCards,
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
    year: Number(r.year.split("-")[0]),  // <-- use r.year
    month: monthNameToNumber(r.month),
    persondays: safeNum(r.persondays),
    householdsWorked: safeNum(r.householdsWorked),
    wageExpenditure: safeNum(r.wageExpenditure),
  }))
  .filter((r) => r.year && r.month)
  .sort((a, b) => a.year - b.year || a.month - b.month);
}

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

async function fetchFromDataGov(state: string, district: string, month: number, year: number) {
  const apiKey = process.env.DATA_GOV_API_KEY;
  const resource = process.env.DATA_GOV_RESOURCE_ID;
  if (!apiKey || !resource) {
    console.warn("[mgnrega] Missing DATA_GOV_API_KEY or DATA_GOV_RESOURCE_ID");
    return null;
  }

  const url = new URL(`https://api.data.gov.in/resource/${resource}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("filters[state_name]", state);
  url.searchParams.set("filters[district_name]", district);
  url.searchParams.set("filters[month]", String(month));
  url.searchParams.set("filters[year]", String(year));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    console.error("[mgnrega] data.gov.in error", await res.text());
    return null;
  }

  const data = await res.json();
  return Array.isArray(data?.records) && data.records.length ? data.records[0] : null;
}

function mapCards(record: any): MetricCards {
  return {
    persondays: firstNumber(record, ["persondays_generated", "persondays", "no_of_persondays_generated"]),
    householdsWorked: firstNumber(record, ["no_of_households_worked", "households_worked", "households"]),
    avgDaysPerHH: firstNumber(record, ["avg_days_per_household", "average_days_per_household", "avg_days"]),
    wageExpenditure: firstNumber(record, ["wage_expenditure", "total_wage_expenditure", "wage_exp"]),
  };
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
