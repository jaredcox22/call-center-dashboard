"use client"

import { Card } from "@/components/ui/card"

interface EmployeeIndicatorProps {
  name: string
  status: "active" | "break" | "offline"
  dials: number
  connections: number
  conversions: number
}

export function EmployeeIndicator({ name, status, dials, connections, conversions }: EmployeeIndicatorProps) {
  const statusColors = {
    active: "bg-green-500",
    break: "bg-yellow-500",
    offline: "bg-gray-500",
  }

  const statusLabels = {
    active: "Active",
    break: "On Break",
    offline: "Offline",
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold">{name}</h4>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
          <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Dials:</span>
          <span className="font-medium">{dials}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Connections:</span>
          <span className="font-medium">{connections}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Conversions:</span>
          <span className="font-medium text-green-500">{conversions}</span>
        </div>
      </div>
    </Card>
  )
}
