// components/home-button.tsx
"use client"

import { useRouter } from "next/navigation"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomeButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={() => router.push("/")}
    >
      <Home className="w-5 h-5" />
      Home
    </Button>
  )
}
