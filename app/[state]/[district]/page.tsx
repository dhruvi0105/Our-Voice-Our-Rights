// app/[state]/[district]/page.tsx (Corrected)

import { getMetricsForDistrictMonth, getTrendForDistrict } from "@/lib/mgnrega"
import NoDataPage from "@/components/no-data-page"
// 🚀 IMPORT THE NEW CLIENT COMPONENT WRAPPER
import { DistrictPageClient } from "@/components/district-page-client" 

type Props = {
  params: { state: string; district: string }
  searchParams?: { month?: string; year?: string }
}

// Convert slugs to title
function slugToTitle(s: string) {
  return decodeURIComponent(s).replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// Utility function (no longer needed here, but kept if used elsewhere)
// function monthLabel(m: number) {
//   return new Date(2000, m - 1, 1).toLocaleString("en-IN", { month: "long" })
// }

export default async function DistrictPage({ params, searchParams }: Props) {
  const stateSlug = params.state
  const districtSlug = params.district

  const month = Number(searchParams?.month) || new Date().getMonth() + 1
  const year = Number(searchParams?.year) || new Date().getFullYear()

  const stateName = slugToTitle(stateSlug)
  const districtName = slugToTitle(districtSlug)

  const metrics = await getMetricsForDistrictMonth(stateName, districtName, month, year)
  if (!metrics || Object.keys(metrics).length === 0) {
    return <NoDataPage stateName={stateName} districtName={districtName} />
  }

  const trend = await getTrendForDistrict(stateName, districtName, year, 12)

  return (
    // 🚀 Pass server-fetched data to the single Client Component wrapper
    <DistrictPageClient 
        stateName={stateName}
        districtName={districtName}
        month={month}
        year={year}
        metrics={metrics}
        trend={trend}
    />
  )
}