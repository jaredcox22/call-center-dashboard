import { useEffect } from 'react'
import { SessionManager } from '@/lib/session-manager'
import { useAuth } from '@/contexts/auth-context'

export function useActivityTracker() {
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) return

    // Update activity on mount
    SessionManager.updateActivity()

    // Check for expiration on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (SessionManager.isSessionExpired()) {
          logout()
        } else {
          SessionManager.updateActivity()
        }
      }
    }

    // Update activity on user interaction
    const updateActivity = () => {
      SessionManager.updateActivity()
    }

    // Listen to various user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    // Throttle activity updates to avoid excessive writes
    let lastUpdate = 0
    const throttledUpdate = () => {
      const now = Date.now()
      if (now - lastUpdate > 60000) { // Update max once per minute
        updateActivity()
        lastUpdate = now
      }
    }

    events.forEach(event => {
      window.addEventListener(event, throttledUpdate)
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledUpdate)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, logout])
}

