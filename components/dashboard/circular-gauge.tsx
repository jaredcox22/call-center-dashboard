"use client"

import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Info } from "lucide-react"
import { useEffect, useState } from "react"

interface MetricRange {
  label: string
  min: number
  max?: number
  color: string
}

interface CircularGaugeProps {
  title: string
  value: number
  max: number
  color: string
  unit: string
  inverted?: boolean
  size?: "small" | "medium" | "large"
  ranges?: MetricRange[]
  target?: number
  formula?: string // Optional formula to display in performance ranges popover
}

export function CircularGauge({ title, value, max, color, unit, inverted = false, size = "medium", ranges, target, formula }: CircularGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  const sizeConfig = {
    small: {
      padding: "p-3",
      titleClass: "mb-2 text-xs",
      gaugeSize: "h-20 w-20",
      svgCenter: 40,
      radius: 30,
      strokeWidth: 6,
      valueClass: "text-lg",
      unitClass: "text-[10px]",
      targetClass: "mt-2 text-[10px]",
    },
    medium: {
      padding: "p-6",
      titleClass: "mb-4 text-sm",
      gaugeSize: "h-32 w-32",
      svgCenter: 64,
      radius: 45,
      strokeWidth: 8,
      valueClass: "text-2xl",
      unitClass: "text-xs",
      targetClass: "mt-4 text-xs",
    },
    large: {
      padding: "p-8",
      titleClass: "mb-6 text-base",
      gaugeSize: "h-40 w-40",
      svgCenter: 80,
      radius: 60,
      strokeWidth: 10,
      valueClass: "text-3xl",
      unitClass: "text-sm",
      targetClass: "mt-6 text-sm",
    },
  }

  const config = sizeConfig[size]
  const percentage = (animatedValue / max) * 100
  const circumference = 2 * Math.PI * config.radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card className={`${config.padding} relative`}>
      {ranges && ranges.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-3.5 w-3.5" />
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
                      {range.min}{unit}{range.max !== undefined ? ` - ${range.max}${unit}` : '+'}
                    </span>
                  </div>
                ))}
              </div>
              {formula && (
                <>
                  <div className="border-t border-border pt-2 mt-2">
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                      {formula}
                    </p>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <h3 className={`text-center font-medium text-muted-foreground ${config.titleClass}`}>{title}</h3>
      <div className={`relative mx-auto ${config.gaugeSize}`}>
        <svg className="h-full w-full -rotate-90 transform">
          {/* Background circle */}
          <circle
            cx={config.svgCenter}
            cy={config.svgCenter}
            r={config.radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-muted"
            opacity="0.2"
          />
          {/* Progress circle */}
          <circle
            cx={config.svgCenter}
            cy={config.svgCenter}
            r={config.radius}
            stroke={color}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.valueClass}`} style={{ color }}>
            {animatedValue}
          </span>
          <span className={`text-muted-foreground ${config.unitClass}`}>{unit}</span>
        </div>
      </div>
      {target !== undefined && (
        <div className={`text-center text-muted-foreground ${config.targetClass}`}>
          {inverted ? `Target: < ${target}${unit}` : `Target: ${target}${unit}`}
        </div>
      )}
    </Card>
  )
}
