const FILTER_STORAGE_KEY = 'dashboard_filters'
const FILTER_EXPIRATION_MS = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
const INACTIVITY_LIMIT_MS = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

export interface FilterState {
  selectedEmployees: string[]
  timePeriod: string
  dashboardType: 'setters' | 'confirmers' | 'ipp'
  confirmedDateRange: {
    from: string | null
    to: string | null
  }
  confirmedTimeRange: {
    startHour: number | null
    endHour: number | null
  }
  secondaryTimePeriod: string
  secondaryConfirmedDateRange: {
    from: string | null
    to: string | null
  }
  secondaryConfirmedTimeRange: {
    startHour: number | null
    endHour: number | null
  }
}

interface StoredFilters {
  filters: FilterState
  savedAt: number
  lastActivity: number
}

export const FilterStorage = {
  // Save filters to localStorage with current timestamp
  saveFilters: (filters: FilterState) => {
    if (typeof window === 'undefined') return

    const now = new Date().getTime()
    const stored: StoredFilters = {
      filters,
      savedAt: now,
      lastActivity: now,
    }

    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(stored))
    } catch (error) {
      // Failed to save filters
    }
  },

  // Update last activity timestamp
  updateActivity: () => {
    if (typeof window === 'undefined') return

    const stored = FilterStorage.loadRawFilters()
    if (stored) {
      stored.lastActivity = new Date().getTime()
      try {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(stored))
      } catch (error) {
        // Failed to update filter activity
      }
    }
  },

  // Load filters from localStorage and validate
  loadFilters: (): FilterState | null => {
    if (typeof window === 'undefined') return null

    const stored = FilterStorage.loadRawFilters()
    if (!stored) return null

    // Check if filters are expired (>8 hours old)
    if (FilterStorage.isFilterExpired(stored)) {
      FilterStorage.clearFilters()
      return null
    }

    // Check if user has been inactive for >8 hours
    if (FilterStorage.isInactive(stored)) {
      FilterStorage.clearFilters()
      return null
    }

    return stored.filters
  },

  // Load raw filters without validation (internal use)
  loadRawFilters: (): StoredFilters | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY)
      if (!stored) return null

      return JSON.parse(stored) as StoredFilters
    } catch (error) {
      return null
    }
  },

  // Check if filters are expired (>8 hours old)
  isFilterExpired: (stored?: StoredFilters): boolean => {
    if (typeof window === 'undefined') return false

    const filters = stored || FilterStorage.loadRawFilters()
    if (!filters) return false

    const now = new Date().getTime()
    const age = now - filters.savedAt

    return age > FILTER_EXPIRATION_MS
  },

  // Check if user has been inactive for >8 hours
  isInactive: (stored?: StoredFilters): boolean => {
    if (typeof window === 'undefined') return false

    const filters = stored || FilterStorage.loadRawFilters()
    if (!filters) return false

    const now = new Date().getTime()
    const timeSinceLastActivity = now - filters.lastActivity

    return timeSinceLastActivity > INACTIVITY_LIMIT_MS
  },

  // Clear stored filters
  clearFilters: () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(FILTER_STORAGE_KEY)
    } catch (error) {
      // Failed to clear filters
    }
  },
}

