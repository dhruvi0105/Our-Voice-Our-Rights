// lib/api.ts
export async function getMetricsForDistrictMonth(
  state: string,
  district: string,
  month: number,
  year: number
) {
  const response = await fetch(
    `/api/mgnrega/metrics?state=${encodeURIComponent(state)}&district=${encodeURIComponent(
      district
    )}&month=${month}&year=${year}`
  )
  if (!response.ok) {
    throw new Error("Failed to fetch metrics")
  }
  return response.json()
}
