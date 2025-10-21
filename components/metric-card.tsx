// components/metric-card.tsx
import { Card, CardContent } from "@/components/ui/card"
import { forwardRef } from "react" // 👈 Import forwardRef

// Define the props type separately for clarity
type MetricCardProps = {
  title: string
  subtitle: string
  value: number
  help?: string
  format?: "number" | "currency"
  variant?: "primary" | "default"
  // Add className prop to apply external styling (like blur/focus in the tour)
  className?: string 
}

// 🚀 Use forwardRef to accept and pass the ref
const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, subtitle, value, format = "number", help, variant, className }, ref) => { // 👈 Destructure 'ref' and 'className'
    
    // Ensure value is a number before formatting, defaulting to 0 if null/undefined
    const numericValue = typeof value === 'number' ? value : 0;
    
    const display =
      format === "currency" 
        ? `₹ ${Intl.NumberFormat("en-IN").format(numericValue)}` 
        : Intl.NumberFormat("en-IN").format(numericValue)

    return (
      <Card 
        ref={ref} // 👈 Attach the forwarded ref here
        className={`${variant === "primary" ? "border-2" : ""} ${className || ''}`} // 👈 Apply external className
        aria-label={`${title} ${subtitle}`}
      >
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
          <div className="text-3xl font-semibold mt-2">{display}</div>
          {help && <div className="text-xs text-muted-foreground mt-1">{help}</div>}
        </CardContent>
      </Card>
    )
  }
)

// Add a display name for better debugging
MetricCard.displayName = 'MetricCard';

export { MetricCard }; // 👈 Export the forwardRef component