import { type NextRequest, NextResponse } from "next/server"
import { getMetricsForDistrictMonth } from "@/lib/mgnrega"

export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get("state")
  const districts = (searchParams.get("districts") || "")
    .split(",")
    .map((d) => decodeURIComponent(d))
    .filter(Boolean)
  const district = searchParams.get("district")
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1
  const year = Number(searchParams.get("year")) || new Date().getFullYear()

  if (!state || (!district && !districts.length)) {
    return NextResponse.json({ error: "missing state and district(s)" }, { status: 400 })
  }

  if (district) {
    const one = await getMetricsForDistrictMonth(state, district, month, year)
    return NextResponse.json({ row: one })
  }

  // multiple
  const rows = await Promise.all(
    districts.map(async (d) => {
      const r = await getMetricsForDistrictMonth(state, d, month, year)
      return r
        ? {
            district: d,
            persondays: r.cards.persondays,
            householdsWorked: r.cards.householdsWorked,
            stale: r.stale,
          }
        : null
    }),
  )

  return NextResponse.json({ rows: rows.filter(Boolean) })
}
