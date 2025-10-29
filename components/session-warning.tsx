"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SessionManager } from "@/lib/session-manager"

export function SessionWarning() {
  const [daysRemaining, setDaysRemaining] = useState(30)
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) return

    const checkExpiration = () => {
      if (SessionManager.isSessionExpired()) {
        logout()
      } else {
        setDaysRemaining(SessionManager.getDaysUntilExpiration())
      }
    }

    checkExpiration()
    const interval = setInterval(checkExpiration, 3600000) // Check hourly

    return () => clearInterval(interval)
  }, [user, logout])

  // Show warning if less than 3 days remaining
  if (!user || daysRemaining > 3) return null

  return (
    <div className="bg-yellow-500/20 dark:bg-yellow-500/10 border-b border-yellow-500/50 p-2 text-center text-sm">
      <span className="text-yellow-900 dark:text-yellow-200">
        ⚠️ Your session will expire in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} of inactivity
      </span>
    </div>
  )
}

