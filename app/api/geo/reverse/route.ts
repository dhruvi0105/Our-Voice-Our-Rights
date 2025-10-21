// Note: For high scale, consider a geocoding provider with SLA & caching. We cache results here via standard fetch caching disabled (we can add Upstash if needed).
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  if (!lat || !lon) {
    return NextResponse.json({ error: "missing lat/lon" }, { status: 400 })
  }
  const url = new URL("https://nominatim.openstreetmap.org/reverse")
  url.searchParams.set("format", "json")
  url.searchParams.set("lat", lat)
  url.searchParams.set("lon", lon)
  url.searchParams.set("zoom", "10")
  url.searchParams.set("addressdetails", "1")

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "OurVoiceOurRights/1.0 (demo)" },
    cache: "no-store",
  })
  if (!res.ok) {
    return NextResponse.json({ error: "geocoding failed" }, { status: 502 })
  }
  const data = await res.json()
  const addr = data?.address || {}
  const district = addr.county || addr.state_district || addr.district || null
  const state = addr.state || null

  return NextResponse.json({ district, state })
}
