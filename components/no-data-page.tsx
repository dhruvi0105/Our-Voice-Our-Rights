"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NoDataPage({ stateName, districtName }: { stateName: string; districtName: string }) {
  const router = useRouter()

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-md border rounded-xl p-6 shadow-sm bg-card">
        <h1 className="text-2xl font-semibold mb-2">No Data Available</h1>
        <p className="text-muted-foreground mb-6">
          Currently, there is no data available for <br />
          <span className="font-medium">{districtName}, {stateName}</span>. <br />
          Please check back later.
        </p>
        <Button onClick={() => router.push("/")} className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Go Back Home
        </Button>
      </div>
    </main>
  )
}
