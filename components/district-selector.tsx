"use client"

import { useState, useMemo } from "react"
import up from "@/data/uttar-pradesh-districts.json"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"

type District = { name: string }

export function DistrictSelector() {
  const [query, setQuery] = useState("")
  const districts = up as District[]
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return districts
    return districts.filter((d) => d.name.toLowerCase().includes(q))
  }, [query, districts])

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Uttar Pradesh District
        <span className="block text-muted-foreground text-xs">उत्तर प्रदेश का ज़िला</span>
      </label>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search district / ज़िला खोजें"
          className="h-12"
        />
        <Button className="h-12" onClick={() => setQuery("")} variant="secondary">
          <Search className="w-4 h-4" />
        </Button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-auto border rounded-md p-2">
        {filtered.map((d) => {
          const stateSlug = "uttar-pradesh"
          const districtSlug = d.name.toLowerCase().replaceAll(" ", "-")
          return (
            <li key={d.name}>
              <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                <a href={`/${stateSlug}/${districtSlug}`}>
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-pretty">{d.name}</span>
                </a>
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
