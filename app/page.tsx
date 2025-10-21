"use client"

import { useState, useRef, useLayoutEffect, forwardRef, useEffect } from "react"
import { DistrictSelector } from "@/components/district-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Compass, Home } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)

  const autoDetectRef = useRef<HTMLButtonElement>(null)
  const districtSelectorRef = useRef<HTMLDivElement>(null)
  const langToggleRef = useRef<HTMLButtonElement>(null)

  // Steps for tooltip overlay
  const steps = [
    { ref: autoDetectRef, text: "Use this button to detect your district via your phone location." },
    { ref: districtSelectorRef, text: "Or select your district manually here." },
  ]

  const isActive = (ref: React.RefObject<any>) => steps[step]?.ref === ref

  // Show tooltip/overlay only on first visit
  useEffect(() => {
    if (typeof window === "undefined") return

    const visited = localStorage.getItem("visited")
    if (!visited) {
      setShowNotification(true)
      setShowOverlay(true)
      localStorage.setItem("visited", "true")
    }
  }, [])

  // Calculate tooltip position when step changes
  useLayoutEffect(() => {
    const currentRef = steps[step]?.ref.current
    if (!currentRef) return

    requestAnimationFrame(() => {
      const rect = currentRef.getBoundingClientRect()
      const offset = 10
      setTooltipPos({
        top: rect.bottom + window.scrollY + offset,
        left: rect.left + window.scrollX,
      })
    })
  }, [step])

  function nextStep() {
    if (step < steps.length - 1) setStep(step + 1)
    else setShowOverlay(false)
  }

  function closeTooltip() {
    if (step < steps.length - 1) setStep(step + 1)
    else setShowOverlay(false)
  }

  return (
    <main className="min-h-dvh flex flex-col relative">
      {/* Overlay */}
      {showOverlay && <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-40 pointer-events-none" />}

      {/* Header */}
      <header className={`w-full border-b bg-card relative z-50 ${!isActive(langToggleRef) && showOverlay ? "blur-sm pointer-events-none" : ""}`}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <Home className="w-6 h-6 text-pretty" />
            <h1 className="text-xl font-semibold text-pretty">Our Voice, Our Rights</h1>
          </div>
        </div>
      </header>

      {/* Main section */}
      <section className="bg-background mt-6">
        <div className="mx-auto max-w-5xl px-4 py-6 grid gap-4 md:grid-cols-2">
          <Card className={`relative z-50 ${!isActive(autoDetectRef) && showOverlay ? "blur-sm pointer-events-none" : ""}`}>
            <CardContent className="p-4 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-pretty">
                Find My District
                <span className="block text-sm text-muted-foreground">मेरा ज़िला ढूँढें</span>
              </h2>
              <p className="text-pretty leading-relaxed">
                Tap to use your phone location and we will try to find your District.
                <span className="block text-muted-foreground text-sm">अपने फ़ोन की लोकेशन से ज़िला पहचानेंगे।</span>
              </p>
              <AutoDetect ref={autoDetectRef} />
            </CardContent>
          </Card>

          <Card className={`relative z-50 ${!isActive(districtSelectorRef) && showOverlay ? "blur-sm pointer-events-none" : ""}`}>
            <CardContent className="p-4 flex flex-col gap-4" ref={districtSelectorRef}>
              <h2 className="text-lg font-semibold text-pretty">
                Select Manually
                <span className="block text-sm text-muted-foreground">खुद चुनें</span>
              </h2>
              <DistrictSelector />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tooltip */}
      {showOverlay && tooltipPos && showNotification && (
        <div
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
          className="absolute z-50 bg-navy-blue border-8 text-white p-4 rounded-lg shadow-lg pointer-events-auto max-w-xs transition-all duration-200"
        >
          <p>{steps[step].text}</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={closeTooltip}>
              Close
            </Button>
            <Button size="sm" onClick={nextStep}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`mt-auto border-t bg-card`}>
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          Data source: data.gov.in (MGNREGA monthly performance). This site caches data to work even when APIs are slow.
        </div>
      </footer>
    </main>
  )
}

// Language toggle button
const LangToggle = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <button
      ref={ref}
      className="text-xs md:text-sm px-2 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition"
      {...props}
    >
      EN + हिंदी
    </button>
  )
})

// Auto-detect district button
const AutoDetect = forwardRef<HTMLButtonElement>((props, ref) => {
  async function onClick() {
    try {
      if (!navigator.geolocation) {
        alert("Location not available on this device.")
        return
      }
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords
            const res = await fetch(`/api/geo/reverse?lat=${latitude}&lon=${longitude}`, { cache: "no-store" })
            const data = await res.json()
            if (data?.state && data?.district) {
              window.location.href = `/${encodeURIComponent(data.state.toLowerCase().replaceAll(" ", "-"))}/${encodeURIComponent(data.district.toLowerCase().replaceAll(" ", "-"))}`
            } else {
              alert("Could not detect district. Please select manually.")
            }
            resolve()
          },
          (err) => {
            console.error(err)
            alert("Permission denied. Please select your district manually.")
            reject(err)
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
      })
    } catch (e) {
      console.error(e)
      alert("Location error. Please select manually.")
    }
  }

  return (
    <Button ref={ref} onClick={onClick} className="w-full h-12 text-base">
      <Compass className="w-5 h-5 mr-2" />
      Use My Location / मेरी लोकेशन
    </Button>
  )
})