"use client"

import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Formats seconds into a human-readable minutes and seconds format
 * Examples: 45 -> "45s", 90 -> "1m 30s", 125 -> "2m 5s"
 */
const formatSecondsToMinutes = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
}

interface MetricRange {
  label: string
  min: number
  max?: number
  color: string
}

interface FeaturedMetricCardProps {
  title: string
  value: number
  unit: string
  color: string
  subtitle?: string
  ranges?: MetricRange[]
  target?: number
  inverted?: boolean
  formattedValue?: string // Optional formatted value to display instead of animated number
}

export function FeaturedMetricCard({ title, value, unit, color, subtitle, ranges, target, inverted = false, formattedValue }: FeaturedMetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <Card className="p-8 min-h-[200px] flex items-center justify-center relative">
      {ranges && ranges.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Performance Ranges</h4>
              <div className="space-y-1.5">
                {ranges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: range.color }}
                      />
                      <span className="font-medium">{range.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formattedValue !== undefined && unit === ""
                        ? (range.max !== undefined 
                            ? `${formatSecondsToMinutes(range.min)} - ${formatSecondsToMinutes(range.max)}`
                            : `${formatSecondsToMinutes(range.min)}+`)
                        : (range.max !== undefined 
                            ? `${range.min}${unit} - ${range.max}${unit}`
                            : `${range.min}${unit}+`)
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      <div className="text-center">
        <h2 className="mb-4 text-lg font-semibold text-muted-foreground">{title}</h2>
        <div
          className="mb-3 text-5xl font-bold transition-all duration-1000 ease-out md:text-6xl lg:text-7xl"
          style={{ color }}
        >
          {formattedValue !== undefined ? formattedValue : (
            <>
              {animatedValue}
              <span className="ml-1 text-2xl md:text-3xl lg:text-4xl">{unit}</span>
            </>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {target !== undefined && (
          <p className="mt-2 text-xs text-muted-foreground">
            {formattedValue !== undefined && unit === "" 
              ? (inverted ? `Target: < ${formatSecondsToMinutes(target)}` : `Target: ${formatSecondsToMinutes(target)}`)
              : (inverted ? `Target: < ${target}${unit}` : `Target: ${target}${unit}`)
            }
          </p>
        )}
      </div>
    </Card>
  )
}

