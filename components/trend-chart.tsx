// components/trend-chart.tsx (or similar)

"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Label } from "recharts"

export function TrendChart({
  data,
}: {
  data: Array<{ year: number; month: number; persondays: number; householdsWorked: number; wageExpenditure: number }>
}) {

  const formatted = data
    .sort((a, b) => a.year - b.year || a.month - b.month) // ensure correct order
    .map((d) => ({
      name: `${shortMonth(d.month)} ${String(d.year).slice(2)}`,
      persondays: d.persondays,
      householdsWorked: d.householdsWorked,
      wageExpenditure: +(d.wageExpenditure / 100).toFixed(2), // in lakhs
    }))

  return (
    <div className="w-full h-[320px] flex flex-col" role="img" aria-label="12-month trend chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={formatted} 
          margin={{ top: 5, right: 5, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeOpacity={0.2} />
          <XAxis dataKey="name" tickMargin={8} />
          <YAxis>
             <Label 
                value="Persondays" 
                angle={-90} 
                position="insideLeft" 
                style={{ textAnchor: 'middle' }}
             />
          </YAxis>
          {/* 🚀 UPDATED TOOLTIP STYLE: Navy background, Aqua border, White text */}
          <Tooltip contentStyle={{ backgroundColor: 'navy', borderColor: 'aqua', color: 'white' }} />
          <Line
            type="monotone"
            dataKey="persondays"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            name="Persondays"
          />
          <Line
            type="monotone"
            dataKey="householdsWorked"
            stroke="oklch(var(--color-chart-2))"
            strokeWidth={2}
            dot={false}
            name="Households"
          />
          <Line
            type="monotone"
            dataKey="wageExpenditure"
            stroke="oklch(var(--color-chart-5))"
            strokeWidth={2}
            dot={false}
            name="Wage (₹L)"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2">Wage shown in ₹ lakhs for readability.</p>
    </div>
  )
}

function shortMonth(m: number) {
  return new Date(2000, m - 1, 1).toLocaleString("en-IN", { month: "short" })
}