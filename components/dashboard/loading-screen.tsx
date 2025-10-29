"use client"

import { useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"

const loadingMessages = [
  "Fetching real-time data...",
  "Preparing analytics...",
  "Gathering metrics...",
  "Almost there...",
]

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl bg-black outline-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="h-20 w-20 rounded-full bg-primary" />
            </div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-10 w-10 animate-pulse text-primary" />
            </div>
          </div>

          {/* Loading Message */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
            <p 
              className="text-sm text-muted-foreground animate-fade-in"
              key={messageIndex}
            >
              {loadingMessages[messageIndex]}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-loading-bar" />
          </div>
        </div>
      </Card>
    </div>
  )
}

