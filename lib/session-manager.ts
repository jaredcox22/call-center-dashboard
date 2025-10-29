const SESSION_KEY = 'dashboard_last_activity'
const INACTIVITY_LIMIT_MS = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

export const SessionManager = {
  // Update last activity timestamp
  updateActivity: () => {
    if (typeof window === 'undefined') return
    const now = new Date().getTime()
    localStorage.setItem(SESSION_KEY, now.toString())
  },

  // Check if session is expired
  isSessionExpired: (): boolean => {
    if (typeof window === 'undefined') return false
    
    const lastActivity = localStorage.getItem(SESSION_KEY)
    if (!lastActivity) return false // No previous session

    const lastActivityTime = parseInt(lastActivity, 10)
    const now = new Date().getTime()
    const timeSinceLastActivity = now - lastActivityTime

    return timeSinceLastActivity > INACTIVITY_LIMIT_MS
  },

  // Get days until expiration
  getDaysUntilExpiration: (): number => {
    if (typeof window === 'undefined') return 30
    
    const lastActivity = localStorage.getItem(SESSION_KEY)
    if (!lastActivity) return 30

    const lastActivityTime = parseInt(lastActivity, 10)
    const now = new Date().getTime()
    const timeSinceLastActivity = now - lastActivityTime
    const timeRemaining = INACTIVITY_LIMIT_MS - timeSinceLastActivity
    
    return Math.ceil(timeRemaining / (24 * 60 * 60 * 1000))
  },

  // Clear session
  clearSession: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_KEY)
  }
}

