"use client"

import { Card } from "@/components/ui/card"

interface EmployeeIndicatorProps {
  name: string
  dials: number
  connections: number
  conversions: number
}

export function EmployeeIndicator({ name, dials, connections, conversions }: EmployeeIndicatorProps) {

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold">{name}</h4>
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
