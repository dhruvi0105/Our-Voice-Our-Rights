"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type MetricRow = {
  district: string
  persondays: number
  householdsWorked: number
}

export function Comparison({
  stateName,
  districtName,
  month,
  year,
}: {
  stateName: string
  districtName: string
  month: number
  year: number
}) {
  // Ensure no duplicate districts in comparison
  const list = Array.from(new Set([districtName, "Agra", "Aligarh", "Allahabad"])).slice(0, 3)

  const { data, error, isLoading } = useSWR(
    `/api/mgnrega/metrics?state=${encodeURIComponent(stateName)}&districts=${list
      .map(encodeURIComponent)
      .join(",")}&month=${month}&year=${year}`,
    fetcher
  )

  if (error)
    return <div className="text-sm text-red-500">Failed to load comparison data.</div>

  if (isLoading)
    return <div className="text-sm text-muted-foreground">Loading comparison…</div>

  const rows = (data?.rows || []) as MetricRow[]
  const uniqueRows = Array.from(new Map(rows.map((r) => [r.district, r])).values())

  return (
    <div className="grid gap-2">
      {uniqueRows.map((r, idx) => (
        <Card key={`${r.district}-${idx}`} className="border-2">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.district}</div>
              <div className="text-sm text-muted-foreground">
                {Intl.NumberFormat("en-IN").format(r.persondays)} persondays
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Households: {Intl.NumberFormat("en-IN").format(r.householdsWorked)}
            </div>
          </CardContent>
        </Card>
      ))}

      {!uniqueRows.length && (
        <div className="text-sm text-muted-foreground">
          No comparison data available.
        </div>
      )}
    </div>
  )
}
