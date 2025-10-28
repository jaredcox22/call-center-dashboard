"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface FeaturedMetricCardProps {
  title: string
  value: number
  unit: string
  color: string
  subtitle?: string
}

export function FeaturedMetricCard({ title, value, unit, color, subtitle }: FeaturedMetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <Card className="p-8 min-h-[200px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-lg font-semibold text-muted-foreground">{title}</h2>
        <div
          className="mb-3 text-5xl font-bold transition-all duration-1000 ease-out md:text-6xl lg:text-7xl"
          style={{ color }}
        >
          {animatedValue}
          <span className="ml-1 text-2xl md:text-3xl lg:text-4xl">{unit}</span>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </Card>
  )
}

