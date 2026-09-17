"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CircularGauge } from "./circular-gauge"
import { EmployeeIndicator } from "./employee-indicator"
import { FeaturedMetricCard } from "./featured-metric-card"
import { STLDataTable } from "./stl-data-table"
import { ConversionDataTable } from "./conversion-data-table"
import { PitchDataTable } from "./pitch-data-table"
import { ConnectionDataTable } from "./connection-data-table"
import { DialsPerHourDataTable } from "./dials-per-hour-data-table"
import { ConversionQualifiedDataTable } from "./conversion-qualified-data-table"
import { ConversionUnqualifiedDataTable } from "./conversion-unqualified-data-table"
import { GrossIssueDataTable } from "./gross-issue-data-table"
import { ScorecardDataTable, type ScorecardRecord } from "./scorecard-data-table"
import { ExcludedRecordsPanel } from "./excluded-records-panel"
import { useExcludedRecords, type ExcludableTableType } from "@/hooks/use-excluded-records"
import {
  EMPTY_CALL_AGGREGATE,
  SECONDARY_DRILLDOWNS,
  isHourInTimeRange,
  summarizeCallAggregate,
  type CallAggregate,
  type DrilldownTable,
} from "@/lib/call-aggregates"
import { RefreshCw, Moon, Sun, CalendarIcon, AlertCircle, ChevronDown, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserMenu } from "./user-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useActivityTracker } from "@/hooks/use-activity-tracker"
import { SessionWarning } from "@/components/session-warning"
import { LoadingScreen } from "./loading-screen"
import { FilterStorage, FilterState } from "@/lib/filter-storage"
import { DemoBanner } from "./demo-banner"
import useSWR from "swr"
import { format } from "date-fns"

type DashboardTab = "setters" | "confirmers" | "gsp"

const isSetterLikeTab = (t: DashboardTab) => t === "setters" || t === "gsp"

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // For CORS with credentials
  })
  
  if (!response.ok) {
    const isLongRange = /Year(\+|%20|\s)?to(\+|%20|\s)?Date|secondaryOnly=1/i.test(url)
    throw new Error(
      isLongRange
        ? 'Failed to load year-to-date performance data. Try again or pick a shorter range.'
        : 'Failed to fetch dashboard data'
    )
  }
  
  return response.json()
}

const isLongDashboardRange = (period: string) =>
  period === 'Year to Date' || period === 'YTD' || period === 'Custom Dates'

// Shared empty references so memo dependencies stay stable across renders
const EMPTY_ROWS: any[] = []
const EMPTY_PRIMARY_PAYLOAD = {
  settersCallsAggregate: EMPTY_CALL_AGGREGATE,
  confirmersCallsAggregate: EMPTY_CALL_AGGREGATE,
  gspCallsAggregate: EMPTY_CALL_AGGREGATE,
  settersHours: EMPTY_ROWS,
  confirmersHours: EMPTY_ROWS,
  gspHours: EMPTY_ROWS,
  settersScorecards: EMPTY_ROWS,
  confirmersScorecards: EMPTY_ROWS,
  settersAppointments: EMPTY_ROWS,
  stl: EMPTY_ROWS,
  levels: EMPTY_ROWS,
  lights: { red: EMPTY_ROWS, green: EMPTY_ROWS },
  callQueueDetails: EMPTY_ROWS,
}

/**
 * Formats seconds into a human-readable format with days, hours, minutes, and seconds
 * Examples: 45 -> "45s", 90 -> "1m 30s", 3665 -> "1h 1m 5s", 488908 -> "5d 15h 48m 28s"
 */
const formatSecondsToMinutes = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  const parts: string[] = []
  
  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`)
  }
  
  return parts.join(' ')
}

/**
 * Converts 24-hour format (0-23) to 12-hour format string for display
 * Examples: 0 -> "12 AM", 8 -> "8 AM", 13 -> "1 PM", 23 -> "11 PM"
 */
const formatHourTo12Hour = (hour: number): string => {
  if (hour === 0) return "12 AM"
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return "12 PM"
  return `${hour - 12} PM`
}

/**
 * Converts 12-hour format string to 24-hour format (0-23)
 * Examples: "12 AM" -> 0, "8 AM" -> 8, "1 PM" -> 13, "11 PM" -> 23
 */
const parse12HourTo24Hour = (timeStr: string): number => {
  const match = timeStr.match(/(\d+)\s*(AM|PM)/i)
  if (!match) return 0
  let hour = parseInt(match[1])
  const period = match[2].toUpperCase()
  if (period === "AM") {
    if (hour === 12) return 0
    return hour
  } else {
    if (hour === 12) return 12
    return hour + 12
  }
}

/**
 * Extracts hour from date string (format: "2025-11-18 08:08:00.553")
 */
const extractHourFromDateString = (dateString: string): number => {
  try {
    const date = new Date(dateString)
    return date.getHours()
  } catch {
    return 0
  }
}

/**
 * Calculates the number of hours in a time range
 */
const calculateHoursInTimeRange = (startHour: number | undefined, endHour: number | undefined): number => {
  if (startHour === undefined || endHour === undefined) {
    return 24 // All Day - 24 hours
  }
  
  // Handle edge case: endHour === 0 means midnight (24)
  const effectiveEndHour = endHour === 0 ? 24 : endHour
  
  if (startHour <= effectiveEndHour) {
    // Normal case: e.g., 8 AM - 5 PM = 9 hours
    return effectiveEndHour - startHour
  } else {
    // Wraps around midnight: e.g., 8 PM - 8 AM = 12 hours
    return (24 - startHour) + effectiveEndHour
  }
}

/**
 * Generates hour options for Select dropdown (0-23 as "12 AM", "1 AM", ..., "11 PM")
 */
const generateHourOptions = () => {
  const options = [{ value: "all-day", label: "All Day" }]
  for (let hour = 0; hour < 24; hour++) {
    options.push({ value: hour.toString(), label: formatHourTo12Hour(hour) })
  }
  return options
}

/**
 * Formats date range button text with optional time range
 */
const formatDateRangeButtonText = (
  from: Date | undefined,
  to: Date | undefined,
  timeRange?: { startHour: number | undefined; endHour: number | undefined }
): string => {
  if (!from || !to) return "Pick dates"
  
  const dateText = `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`
  
  if (timeRange && timeRange.startHour !== undefined && timeRange.endHour !== undefined) {
    const timeText = `${formatHourTo12Hour(timeRange.startHour)} - ${formatHourTo12Hour(timeRange.endHour)}`
    return `${dateText} (${timeText})`
  }
  
  return dateText
}

/**
 * Formats employee selection display text
 */
const formatEmployeeSelectionText = (selectedEmployees: string[]): string => {
  if (selectedEmployees.length === 0) {
    return "All Employees"
  }
  if (selectedEmployees.length === 1) {
    return selectedEmployees[0]
  }
  if (selectedEmployees.length === 2) {
    return `${selectedEmployees[0]}, ${selectedEmployees[1]}`
  }
  return `${selectedEmployees.length} selected`
}

/**
 * Converts filter state to storage format (serializes dates)
 */
const serializeFilterState = (
  selectedEmployees: string[],
  timePeriod: string,
  dashboardType: DashboardTab,
  confirmedDateRange: { from: Date | undefined; to?: Date | undefined },
  confirmedTimeRange: { startHour: number | undefined; endHour: number | undefined },
  secondaryTimePeriod: string,
  secondaryConfirmedDateRange: { from: Date | undefined; to?: Date | undefined },
  secondaryConfirmedTimeRange: { startHour: number | undefined; endHour: number | undefined },
  selectedCallBucketsQualified: string[],
  selectedCallBucketsUnqualified: string[]
): FilterState => {
  return {
    selectedEmployees,
    timePeriod,
    dashboardType,
    confirmedDateRange: {
      from: confirmedDateRange.from ? confirmedDateRange.from.toISOString() : null,
      to: confirmedDateRange.to ? confirmedDateRange.to.toISOString() : null,
    },
    confirmedTimeRange: {
      startHour: confirmedTimeRange.startHour ?? null,
      endHour: confirmedTimeRange.endHour ?? null,
    },
    secondaryTimePeriod,
    secondaryConfirmedDateRange: {
      from: secondaryConfirmedDateRange.from ? secondaryConfirmedDateRange.from.toISOString() : null,
      to: secondaryConfirmedDateRange.to ? secondaryConfirmedDateRange.to.toISOString() : null,
    },
    secondaryConfirmedTimeRange: {
      startHour: secondaryConfirmedTimeRange.startHour ?? null,
      endHour: secondaryConfirmedTimeRange.endHour ?? null,
    },
    callBucketsQualified: selectedCallBucketsQualified,
    callBucketsUnqualified: selectedCallBucketsUnqualified,
  }
}

/**
 * Converts storage format to filter state (deserializes dates)
 */
const deserializeFilterState = (stored: FilterState): {
  selectedEmployees: string[]
  timePeriod: string
  dashboardType: DashboardTab
  confirmedDateRange: { from: Date | undefined; to?: Date | undefined }
  confirmedTimeRange: { startHour: number | undefined; endHour: number | undefined }
  secondaryTimePeriod: string
  secondaryConfirmedDateRange: { from: Date | undefined; to?: Date | undefined }
  secondaryConfirmedTimeRange: { startHour: number | undefined; endHour: number | undefined }
  selectedCallBucketsQualified: string[]
  selectedCallBucketsUnqualified: string[]
} => {
  const legacyBuckets = Array.isArray((stored as any).callBuckets)
    ? (stored as any).callBuckets
    : (stored as any).callBucket != null && (stored as any).callBucket !== 'all'
      ? [(stored as any).callBucket]
      : null
  const qualified = Array.isArray(stored.callBucketsQualified) ? stored.callBucketsQualified : (legacyBuckets ?? [])
  const unqualified = Array.isArray(stored.callBucketsUnqualified) ? stored.callBucketsUnqualified : (legacyBuckets ?? [])
  const validDashboardTabs: DashboardTab[] = ['setters', 'confirmers', 'gsp']
  // 'ipp' is a legacy persisted value from before the tab was renamed to 'gsp'
  const storedTab: string = stored.dashboardType
  const dashboardType: DashboardTab = storedTab === 'ipp'
    ? 'gsp'
    : validDashboardTabs.includes(storedTab as DashboardTab)
      ? (storedTab as DashboardTab)
      : 'setters'
  return {
    selectedEmployees: stored.selectedEmployees,
    timePeriod: stored.timePeriod,
    dashboardType,
    confirmedDateRange: {
      from: stored.confirmedDateRange.from ? new Date(stored.confirmedDateRange.from) : undefined,
      to: stored.confirmedDateRange.to ? new Date(stored.confirmedDateRange.to) : undefined,
    },
    confirmedTimeRange: {
      startHour: stored.confirmedTimeRange.startHour ?? undefined,
      endHour: stored.confirmedTimeRange.endHour ?? undefined,
    },
    secondaryTimePeriod: stored.secondaryTimePeriod,
    secondaryConfirmedDateRange: {
      from: stored.secondaryConfirmedDateRange.from ? new Date(stored.secondaryConfirmedDateRange.from) : undefined,
      to: stored.secondaryConfirmedDateRange.to ? new Date(stored.secondaryConfirmedDateRange.to) : undefined,
    },
    secondaryConfirmedTimeRange: {
      startHour: stored.secondaryConfirmedTimeRange.startHour ?? undefined,
      endHour: stored.secondaryConfirmedTimeRange.endHour ?? undefined,
    },
    selectedCallBucketsQualified: qualified,
    selectedCallBucketsUnqualified: unqualified,
  }
}

type DateRangeSelection = { from: Date | undefined; to?: Date | undefined }

const LIVE_API_URL = "https://api.integrityprodserver.com/dashboards/ccHorsepower.php"
const DEMO_API_URL = "/api/demo/dashboard"

/** End date is exclusive server-side, so send the day after the selected end. */
const formatExclusiveEndDate = (to: Date) => {
  const nextDay = new Date(to)
  nextDay.setDate(nextDay.getDate() + 1)
  return format(nextDay, 'yyyy-MM-dd')
}

type WindowParams = {
  /** Scope flag the endpoint uses to skip the window we don't need. */
  scope: 'primary' | 'secondary'
  dateRange: string
  customRange?: DateRangeSelection
  lpId?: number | null
  /** Admin-excluded call IDs, applied server-side before aggregation. */
  excludeCallIds?: string
}

/**
 * Each request carries only the window it needs. That keeps the two sections'
 * SWR cache keys independent, so changing one section's filter never invalidates
 * the other, and lets the endpoint skip the work for the window we didn't ask for.
 */
const buildWindowParams = ({ scope, dateRange, customRange, lpId, excludeCallIds }: WindowParams) => {
  const params = new URLSearchParams()

  if (scope === 'primary') {
    params.append('dateRange', dateRange)
    if (dateRange === 'Custom Dates' && customRange?.from && customRange?.to) {
      params.append('startDate', format(customRange.from, 'yyyy-MM-dd'))
      params.append('endDate', formatExclusiveEndDate(customRange.to))
    }
    params.append('skipSecondary', '1')
  } else {
    // dateRange is required by the endpoint but unused when secondaryOnly is set.
    // Pinning it to the cheapest window keeps this key independent of the top filter.
    params.append('dateRange', 'Today')
    params.append('secondaryDateRange', dateRange)
    if (dateRange === 'Custom Dates' && customRange?.from && customRange?.to) {
      params.append('secondaryStartDate', format(customRange.from, 'yyyy-MM-dd'))
      params.append('secondaryEndDate', formatExclusiveEndDate(customRange.to))
    }
    params.append('secondaryOnly', '1')
  }

  if (lpId !== null && lpId !== undefined) {
    params.append('lpId', lpId.toString())
  }
  if (excludeCallIds) {
    params.append('excludeCallIds', excludeCallIds)
  }

  return params
}

/** Metric cards and the employee table, served from pre-aggregated call buckets. */
const buildAggregateApiUrl = (window: WindowParams, useDemoData: boolean | undefined) => {
  if (useDemoData) return DEMO_API_URL
  return `${LIVE_API_URL}?${buildWindowParams(window).toString()}`
}

/** Raw rows for a single drill-down table, fetched only while it is open. */
const buildDrilldownApiUrl = (
  table: DrilldownTable,
  tab: DashboardTab,
  window: WindowParams,
  useDemoData: boolean | undefined
) => {
  if (useDemoData) return DEMO_API_URL
  const params = buildWindowParams(window)
  params.append('rowsFor', table)
  params.append('tab', tab)
  return `${LIVE_API_URL}?${params.toString()}`
}

// Type for excluded record IDs by table type
interface ExcludedIdsByTable {
  stl: Set<string>
  connection: Set<string>
  pitch: Set<string>
  conversion: Set<string>
  dialsPerHour: Set<string>
  grossIssue: Set<string>
  conversionQualified: Set<string>
  conversionUnqualified: Set<string>
}

const transformApiData = (
  apiData: any, 
  selectedEmployees: string[], 
  dashboardType: DashboardTab,
  timeRange?: { startHour: number | undefined; endHour: number | undefined },
  excludedIds?: ExcludedIdsByTable,
  selectedCallBuckets?: string[]
) => {
  // Calls arrive pre-aggregated by employee / hour / call bucket / qualified.
  // Excluded call IDs are applied server-side before aggregation, since individual
  // calls can no longer be subtracted from a bucket total here.
  const callsKey =
    dashboardType === 'setters'
      ? 'settersCalls'
      : dashboardType === 'gsp'
        ? 'gspCalls'
        : 'confirmersCalls'
  const callAggregate: CallAggregate = apiData[`${callsKey}Aggregate`] || EMPTY_CALL_AGGREGATE

  // Get scorecards based on dashboard type
  const scorecardsKey =
    dashboardType === 'setters' || dashboardType === 'gsp'
      ? 'settersScorecards'
      : dashboardType === 'confirmers'
        ? 'confirmersScorecards'
        : 'settersScorecards'
  const allScorecards = apiData[scorecardsKey] || []
  
  // Get hours based on dashboard type
  const hoursKey =
    dashboardType === 'setters'
      ? 'settersHours'
      : dashboardType === 'gsp'
        ? 'gspHours'
        : 'confirmersHours'
  const allHours = apiData[hoursKey] || []
  
  // Keep team-wide STL data (checkout to dial time is a TEAM metric)
  let teamStl = apiData.stl || []
  
  // Filter out excluded STL records (using leadId)
  if (excludedIds && excludedIds.stl.size > 0) {
    teamStl = teamStl.filter((stl: any) => !excludedIds.stl.has(String(stl.leadId)))
  }
  
  // Apply the employee / hour / call-bucket filters to the aggregate buckets
  const { totals: callTotals, byEmployee: callTotalsByEmployee } = summarizeCallAggregate(
    callAggregate,
    selectedEmployees,
    timeRange,
    selectedCallBuckets
  )

  // Filter STL data by time range if provided
  let timeFilteredStl = teamStl
  if (timeRange && (timeRange.startHour !== undefined || timeRange.endHour !== undefined)) {
    timeFilteredStl = teamStl.filter((stl: any) => {
      if (!stl.callDate) return false
      const hour = extractHourFromDateString(stl.callDate)
      return isHourInTimeRange(hour, timeRange.startHour, timeRange.endHour)
    })
  }
  
  // Filter data by employee if employees are selected
  let filteredHours = allHours
  let filteredScorecards = allScorecards
  
  if (selectedEmployees.length > 0) {
    filteredHours = allHours.filter((h: any) => selectedEmployees.includes(h.employee))
    filteredScorecards = allScorecards.filter((scorecard: any) => selectedEmployees.includes(scorecard.employee))
  }
  
  // Calculate metrics from calls and hours for all dashboard types
  const employees = new Map()
  const hoursByEmployee = new Map<string, number>()
  
  // Create a map of hours by employee name
  filteredHours.forEach((h: any) => {
    if (h.employee) {
      let adjustedHours = h.hours || 0
      
      // Adjust hours based on time range if provided
      if (timeRange && (timeRange.startHour !== undefined || timeRange.endHour !== undefined)) {
        const hoursInRange = calculateHoursInTimeRange(timeRange.startHour, timeRange.endHour)
        // Proportionally adjust: originalHours * (hoursInRange / 24)
        adjustedHours = hoursInRange;
      }
      
      hoursByEmployee.set(h.employee, adjustedHours)
    }
  })

  const positiveMultiplier = dashboardType === 'gsp' ? 8 : 10

  // Calculate per-employee stats
  callTotalsByEmployee.forEach((employeeCallTotals, employeeName) => {
    const { dials, connected, pitched, positive } = employeeCallTotals
    const hours = hoursByEmployee.get(employeeName) || 0
    
    // Calculate horsepower per employee using the same formula as team metric (setters and GSP)
    const horsepower = isSetterLikeTab(dashboardType) && dials > 0 && hours > 0
      ? Math.round(
          (((dials - connected) * 1.2) + 
          ((connected - pitched) * 1.5) + 
          ((pitched - positive) * 4) + 
          (positive * positiveMultiplier)) / hours
        )
      : 0
    
    employees.set(employeeName, {
      dials,
      connections: connected,
      conversions: positive,
      pitches: pitched,
      hours: hours,
      horsepower: horsepower,
    })
  })
  
  // For GSP dashboard, also add employees from hours even if they have no calls
  if (dashboardType === 'gsp') {
    hoursByEmployee.forEach((hours, employeeName) => {
      if (!employees.has(employeeName)) {
        employees.set(employeeName, {
          dials: 0,
          connections: 0,
          conversions: 0,
          pitches: 0,
          hours: hours,
          horsepower: 0,
        })
      }
    })
  }
  
  // Calculate overall metrics
  const totalCalls = callTotals.dials
  const totalConnected = callTotals.connected
  const totalPitched = callTotals.pitched
  const totalPositive = callTotals.positive

  // Qualified/unqualified counts are over pitched calls only
  const totalQualified = callTotals.qualified
  const totalUnqualified = callTotals.unqualified
  const totalQualifiedConversions = callTotals.qualifiedConversions
  const totalUnqualifiedConversions = callTotals.unqualifiedConversions
  
  // Get appointments data for gross issue calculation (only for setters dashboard)
  let allAppointments: any[] = []
  let filteredAppointments: any[] = []
  let totalAppointments = 0
  let totalIssuedFromAppointments = 0
  
  if (isSetterLikeTab(dashboardType)) {
    allAppointments = apiData.settersAppointments || []
    
    // Filter appointments by selected employees
    filteredAppointments = allAppointments
    if (selectedEmployees.length > 0) {
      filteredAppointments = allAppointments.filter((apt: any) => selectedEmployees.includes(apt.employee))
    }
    
    // Filter out excluded appointment records
    if (excludedIds && excludedIds.grossIssue.size > 0) {
      filteredAppointments = filteredAppointments.filter((apt: any) => !excludedIds.grossIssue.has(String(apt.id)))
    }
    
    // Filter to only appointments where ApptSet > 0 (same as table)
    filteredAppointments = filteredAppointments.filter((apt: any) => apt.ApptSet != null && apt.ApptSet > 0)
    
    // Calculate totalAppointments and totalIssued from appointments
    // Gross Issue Rate = (Total Issued / Total Appointments) * 100
    totalAppointments = filteredAppointments.length
    totalIssuedFromAppointments = filteredAppointments.filter((apt: any) => apt.Issued != null && apt.Issued > 0).length
  }
  
  // Calculate totalApptSet and totalIssued from calls (for confirmers dashboard and backward compatibility)
  const totalApptSet = callTotals.apptSet
  const totalIssuedFromCalls = callTotals.issued
  
  // Calculate total hours (using adjusted hours if time range is provided)
  const totalHours: number = Array.from(hoursByEmployee.values()).reduce((sum: number, hours: number) => sum + hours, 0)
  
  // Calculate average STL (checkout to dial time) in seconds - TEAM metric only
  // Only include STL values greater than 0 in the average
  const validStl = timeFilteredStl.filter((s: any) => s.stl > 0)
  const avgStl = validStl.length > 0 
    ? validStl.reduce((sum: number, s: any) => sum + s.stl, 0) / validStl.length
    : 0
  
  // Calculate metrics - return 0 if no data
  const dialsPerHour = totalCalls > 0 && totalHours > 0 ? Math.round(totalCalls / totalHours) : 0
  const connectionRate = totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 100) : 0
  const pitchRate = totalConnected > 0 ? Math.round((totalPitched / totalConnected) * 100) : 0
  const conversionRate = totalPitched > 0 ? Math.round((totalPositive / totalPitched) * 100) : 0
  const conversionQualified = totalQualified > 0 ? Math.round((totalQualifiedConversions / totalQualified) * 100) : 0
  const conversionUnqualified = totalUnqualified > 0 ? Math.round((totalUnqualifiedConversions / totalUnqualified) * 100) : 0
  // Calculate grossIssue from appointments (for setters) or calls (for confirmers)
  const grossIssue = isSetterLikeTab(dashboardType) 
    ? (totalAppointments > 0 ? Math.round((totalIssuedFromAppointments / totalAppointments) * 100) : 0)
    : (totalApptSet > 0 ? Math.round((totalIssuedFromCalls / totalApptSet) * 100) : 0)
  
  // Calculate scorecard percentage: sum of actualTotals / sum of maxTotals * 100
  let scoreCard = 0
  if (filteredScorecards.length > 0) {
    const totalActual = filteredScorecards.reduce((sum: number, sc: any) => sum + (sc.actualTotal || 0), 0)
    const totalMax = filteredScorecards.reduce((sum: number, sc: any) => sum + (sc.maxTotal || 0), 0)
    scoreCard = totalMax > 0 ? Math.round((totalActual / totalMax) * 100) : 0
  }
  
  // Calculate horsepower using weighted point system (normalized per hour):
  // - No connection (dials): 1.2 points per dial
  // - Connected but no pitch: 1.5 points per connection
  // - Pitched but no conversion: 4 points per pitch
  // - Conversion: 10 points per positive (setters), 8 points per positive (GSP)
  const horsepower = totalCalls > 0 && totalHours > 0
    ? Math.round(
        (((totalCalls - totalConnected) * 1.2) + 
        ((totalConnected - totalPitched) * 1.5) + 
        ((totalPitched - totalPositive) * 4) + 
        (totalPositive * positiveMultiplier)) / totalHours
      )
    : 0
  
  // Calculate skill score using new formula:
  // SkillScore = 100 × (0.40·SCnorm + 0.10·QCRnorm + 0.30·UCRnorm + 0.20·GIRnorm)
  // SCnorm = SC ÷ 100 (scorecard)
  // QCRnorm = QCR ÷ 100 (qualified conversion rate)
  // UCRnorm = UCR ÷ 40 (unqualified conversion rate)
  // GIRnorm = GIR ÷ 85 (gross issue rate)
  // Return 0 if no data (no calls and no scorecards)
  const hasData = totalCalls > 0 || filteredScorecards.length > 0
  const SCnorm = hasData ? Math.min(1.0, scoreCard / 100) : 0
  const QCRnorm = hasData ? Math.min(1.0, conversionQualified / 100) : 0
  const UCRnorm = hasData ? Math.min(1.0, conversionUnqualified / 40) : 0
  const GIRnorm = hasData ? Math.min(1.0, grossIssue / 85) : 0
  
  const skillScore = hasData 
    ? Math.min(100, Math.round(100 * (0.40 * SCnorm + 0.10 * QCRnorm + 0.30 * UCRnorm + 0.20 * GIRnorm)))
    : 0
  
  // Check if there's confirmers data (only relevant when on confirmers dashboard)
  const hasConfirmersData = dashboardType === 'confirmers' && (totalCalls > 0 || filteredScorecards.length > 0)
  
  // Calculate confirmers-specific metrics
  // Contact Rate: percentage of calls that were connected
  const contactRate = hasConfirmersData && totalCalls > 0 
    ? Math.round((totalConnected / totalCalls) * 100) 
    : 0
  
  // Gross Issue Rate: percentage of appointments set that resulted in issues
  const grossIssueRate = hasConfirmersData && totalApptSet > 0
    ? Math.round((totalIssuedFromCalls / totalApptSet) * 100)
    : 0

  // Net Issue Rate: percentage of connected calls that resulted in issues
  const netIssueRate = hasConfirmersData && totalConnected > 0
    ? Math.round((totalIssuedFromCalls / totalConnected) * 100)
    : 0
  
  // 1-Leg Rate: percentage of calls that resulted in a pitch (successful contact and pitch)
  // This represents the percentage of all calls that achieved both connection and pitch
  const oneLegsRate = hasConfirmersData && totalCalls > 0
    ? Math.round((totalPitched / totalCalls) * 100)
    : 0
  
  return {
    employees: Array.from(employees.entries()).map(([name, stats], index) => ({
      id: String(index + 1),
      name,
      dials: (stats as any).dials,
      connections: (stats as any).connections,
      pitches: (stats as any).pitches,
      conversions: (stats as any).conversions,
      hours: (stats as any).hours,
      horsepower: (stats as any).horsepower,
    })),
    settersMetrics: {
      dialsPerHour,
      connectionRate,
      pitchRate,
      conversionRate,
      horsepower,
      skillScore,
      scoreCard,
      conversionQualified,
      conversionUnqualified,
      grossIssue,
      checkoutToDialTime: Math.round(avgStl),
    },
    confirmersMetrics: {
      // Calculate from actual confirmersCalls data, respecting date and employee filters
      contactRate,
      grossIssueRate,
      netIssueRate,
      oneLegsRate,
      scorecard: (dashboardType === 'confirmers') ? scoreCard : 0, // Use scorecard calculation for confirmers only
    },
  }
}

export function DashboardContent() {
  const { user, logout, isAdmin, isAgent, isDemoUser, hasTeamView, lpId } = useAuth()
  const canExcludeRecords = isAdmin || isDemoUser
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [timePeriod, setTimePeriod] = useState("Today")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedCallBucketsQualified, setSelectedCallBucketsQualified] = useState<string[]>([])
  const [selectedCallBucketsUnqualified, setSelectedCallBucketsUnqualified] = useState<string[]>([])
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false)
  const [dashboardType, setDashboardType] = useState<DashboardTab>("setters")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  })
  const [confirmedDateRange, setConfirmedDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  })
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false)
  const [stlTableOpen, setStlTableOpen] = useState(false)
  const [conversionTableOpen, setConversionTableOpen] = useState(false)
  const [pitchTableOpen, setPitchTableOpen] = useState(false)
  const [connectionTableOpen, setConnectionTableOpen] = useState(false)
  const [dialsPerHourTableOpen, setDialsPerHourTableOpen] = useState(false)
  const [conversionQualifiedTableOpen, setConversionQualifiedTableOpen] = useState(false)
  const [conversionUnqualifiedTableOpen, setConversionUnqualifiedTableOpen] = useState(false)
  const [grossIssueTableOpen, setGrossIssueTableOpen] = useState(false)
  const [scorecardTableOpen, setScorecardTableOpen] = useState(false)
  const [excludedRecordsPanelOpen, setExcludedRecordsPanelOpen] = useState(false)
  
  // Excluded records hook - syncs with Firestore
  const {
    excludedRecords,
    loading: excludedRecordsLoading,
    getExcludedIdsForTable,
    excludeRecords,
    restoreByDocIds,
  } = useExcludedRecords()
  
  // Time range state for primary date range
  const [customTimeRange, setCustomTimeRange] = useState<{ startHour: number | undefined; endHour: number | undefined }>({
    startHour: undefined,
    endHour: undefined
  })
  const [confirmedTimeRange, setConfirmedTimeRange] = useState<{ startHour: number | undefined; endHour: number | undefined }>({
    startHour: undefined,
    endHour: undefined
  })
  
  // Secondary date range state for performance metrics
  const [secondaryTimePeriod, setSecondaryTimePeriod] = useState("Rolling 30 Days")
  const [secondaryCustomDateRange, setSecondaryCustomDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  })
  const [secondaryConfirmedDateRange, setSecondaryConfirmedDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  })
  const [secondaryDatePickerOpen, setSecondaryDatePickerOpen] = useState(false)
  const [secondaryMobilePickerOpen, setSecondaryMobilePickerOpen] = useState(false)
  
  // Time range state for secondary date range
  const [secondaryCustomTimeRange, setSecondaryCustomTimeRange] = useState<{ startHour: number | undefined; endHour: number | undefined }>({
    startHour: undefined,
    endHour: undefined
  })
  const [secondaryConfirmedTimeRange, setSecondaryConfirmedTimeRange] = useState<{ startHour: number | undefined; endHour: number | undefined }>({
    startHour: undefined,
    endHour: undefined
  })

  // Track user activity for session management
  useActivityTracker()

  // Load filters from localStorage on mount
  // For agents, clear selectedEmployees to ensure they only see their own data
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  useEffect(() => {
    const stored = FilterStorage.loadFilters()
    if (stored) {
      const deserialized = deserializeFilterState(stored)
      // Only load selectedEmployees for admins and demo users
      if (hasTeamView) {
        setSelectedEmployees(deserialized.selectedEmployees)
      } else {
        setSelectedEmployees([])
      }
      setTimePeriod(deserialized.timePeriod)
      setDashboardType(deserialized.dashboardType)
      setConfirmedDateRange(deserialized.confirmedDateRange)
      setConfirmedTimeRange(deserialized.confirmedTimeRange)
      setSecondaryTimePeriod(deserialized.secondaryTimePeriod)
      setSecondaryConfirmedDateRange(deserialized.secondaryConfirmedDateRange)
      setSecondaryConfirmedTimeRange(deserialized.secondaryConfirmedTimeRange)
      setSelectedCallBucketsQualified(deserialized.selectedCallBucketsQualified ?? [])
      setSelectedCallBucketsUnqualified(deserialized.selectedCallBucketsUnqualified ?? [])
    } else {
      // If no stored filters, ensure agents have empty selectedEmployees
      if (!hasTeamView) {
        setSelectedEmployees([])
      }
    }
    setFiltersLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTeamView]) // Re-run when team view access changes

  // Only build API URL if we have complete date range for custom dates
  // For agents, pass their LP ID to filter data; for admins, don't pass LP ID (get all data)
  // Split primary vs secondary so a slow YTD performance window cannot take down Today's metrics.
  const agentLpId = isAgent ? lpId : null

  // Exclusions are applied server-side before aggregating, so we wait for them to
  // load rather than firing an expensive request and immediately re-fetching.
  const excludeCallIdsParam = useMemo(() => {
    const callTableTypes: ExcludableTableType[] = [
      'connection', 'pitch', 'conversion', 'dialsPerHour', 'conversionQualified', 'conversionUnqualified',
    ]
    const ids = new Set<string>()
    for (const tableType of callTableTypes) {
      for (const id of getExcludedIdsForTable(tableType)) ids.add(id)
    }
    return Array.from(ids).sort().join(',')
  }, [getExcludedIdsForTable])

  const hasCompletePrimaryRange = !(timePeriod === 'Custom Dates' && (!confirmedDateRange.from || !confirmedDateRange.to))
  const hasCompleteSecondaryRange = !(secondaryTimePeriod === 'Custom Dates' && (!secondaryConfirmedDateRange.from || !secondaryConfirmedDateRange.to))
  const canFetchPrimary = hasCompletePrimaryRange && !excludedRecordsLoading
  const canFetchSecondary = hasCompleteSecondaryRange && !excludedRecordsLoading

  const primaryWindow: WindowParams = useMemo(() => ({
    scope: 'primary',
    dateRange: timePeriod,
    customRange: confirmedDateRange,
    lpId: agentLpId,
    excludeCallIds: excludeCallIdsParam,
  }), [timePeriod, confirmedDateRange, agentLpId, excludeCallIdsParam])

  const secondaryWindow: WindowParams = useMemo(() => ({
    scope: 'secondary',
    dateRange: secondaryTimePeriod || 'Rolling 30 Days',
    customRange: secondaryConfirmedDateRange,
    lpId: agentLpId,
    excludeCallIds: excludeCallIdsParam,
  }), [secondaryTimePeriod, secondaryConfirmedDateRange, agentLpId, excludeCallIdsParam])

  const primaryApiUrl = canFetchPrimary ? buildAggregateApiUrl(primaryWindow, isDemoUser) : null
  const secondaryApiUrl = canFetchSecondary ? buildAggregateApiUrl(secondaryWindow, isDemoUser) : null

  const {
    data: primaryRawData,
    error,
    mutate: mutatePrimary,
    isValidating: isPrimaryValidating,
  } = useSWR(primaryApiUrl, fetcher, {
    refreshInterval: isLongDashboardRange(timePeriod) ? 120000 : 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: isLongDashboardRange(timePeriod) ? 60000 : 10000,
    keepPreviousData: true,
  })

  const {
    data: secondaryRawData,
    error: secondaryError,
    mutate: mutateSecondary,
    isLoading: isSecondaryLoading,
    isValidating: isSecondaryValidating,
  } = useSWR(secondaryApiUrl, fetcher, {
    refreshInterval: isLongDashboardRange(secondaryTimePeriod) ? 300000 : 30000,
    revalidateOnFocus: !isLongDashboardRange(secondaryTimePeriod),
    revalidateOnReconnect: true,
    dedupingInterval: isLongDashboardRange(secondaryTimePeriod) ? 120000 : 10000,
    shouldRetryOnError: true,
    errorRetryCount: 2,
    keepPreviousData: true,
  })

  const mutate = useCallback(() => {
    void mutatePrimary()
    void mutateSecondary()
  }, [mutatePrimary, mutateSecondary])

  // Merge the two responses into the shape the rest of the component expects.
  // Either half may still be loading, so missing sections fall back to empty.
  const rawData = useMemo(() => {
    if (!primaryRawData && !secondaryRawData) return null
    return {
      ...(primaryRawData ?? EMPTY_PRIMARY_PAYLOAD),
      secondarySettersCallsAggregate: secondaryRawData?.secondarySettersCallsAggregate ?? EMPTY_CALL_AGGREGATE,
      secondaryConfirmersCallsAggregate: secondaryRawData?.secondaryConfirmersCallsAggregate ?? EMPTY_CALL_AGGREGATE,
      secondaryGspCallsAggregate: secondaryRawData?.secondaryGspCallsAggregate ?? EMPTY_CALL_AGGREGATE,
      secondarySettersHours: secondaryRawData?.secondarySettersHours ?? EMPTY_ROWS,
      secondaryConfirmersHours: secondaryRawData?.secondaryConfirmersHours ?? EMPTY_ROWS,
      secondaryGspHours: secondaryRawData?.secondaryGspHours ?? EMPTY_ROWS,
      secondarySettersScorecards: secondaryRawData?.secondarySettersScorecards ?? EMPTY_ROWS,
      secondaryConfirmersScorecards: secondaryRawData?.secondaryConfirmersScorecards ?? EMPTY_ROWS,
      secondarySettersAppointments: secondaryRawData?.secondarySettersAppointments ?? EMPTY_ROWS,
      callQueueDetails:
        primaryRawData?.callQueueDetails ?? secondaryRawData?.callQueueDetails ?? EMPTY_ROWS,
    }
  }, [primaryRawData, secondaryRawData])

  // Pending = nothing to show yet. Refreshing = showing the previous window while
  // the newly selected one loads, so the section stays readable either way.
  const isSecondaryPending =
    Boolean(secondaryApiUrl) && !secondaryRawData && !secondaryError && (isSecondaryLoading || isSecondaryValidating)
  const isSecondaryRefreshing = Boolean(secondaryRawData) && isSecondaryValidating
  const isPrimaryRefreshing = Boolean(primaryRawData) && isPrimaryValidating

  // Only one drill-down dialog can be open at a time, so a single request serves
  // whichever one the user opened. Raw call rows are never part of the page load.
  const openDrilldown: DrilldownTable | null =
    connectionTableOpen ? 'connection'
      : pitchTableOpen ? 'pitch'
        : conversionTableOpen ? 'conversion'
          : dialsPerHourTableOpen ? 'dialsPerHour'
            : conversionQualifiedTableOpen ? 'conversionQualified'
              : conversionUnqualifiedTableOpen ? 'conversionUnqualified'
                : null

  const drilldownApiUrl = openDrilldown
    ? buildDrilldownApiUrl(
        openDrilldown,
        dashboardType,
        SECONDARY_DRILLDOWNS.includes(openDrilldown) ? secondaryWindow : primaryWindow,
        isDemoUser
      )
    : null

  const {
    data: drilldownData,
    error: drilldownError,
    isLoading: isDrilldownLoading,
  } = useSWR(drilldownApiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    keepPreviousData: false,
  })

  // Guard against showing a previous table's rows while a new request is in flight
  const drilldownRows: any[] = useMemo(
    () => (openDrilldown && drilldownData?.rowsFor === openDrilldown ? (drilldownData.rows ?? EMPTY_ROWS) : EMPTY_ROWS),
    [openDrilldown, drilldownData]
  )
  const isDrilldownPending = Boolean(openDrilldown) && drilldownRows.length === 0 && isDrilldownLoading

  // Build excluded IDs object for transformApiData
  const excludedIdsForTransform: ExcludedIdsByTable = useMemo(() => ({
    stl: getExcludedIdsForTable("stl"),
    connection: getExcludedIdsForTable("connection"),
    pitch: getExcludedIdsForTable("pitch"),
    conversion: getExcludedIdsForTable("conversion"),
    dialsPerHour: getExcludedIdsForTable("dialsPerHour"),
    grossIssue: getExcludedIdsForTable("grossIssue"),
    conversionQualified: getExcludedIdsForTable("conversionQualified"),
    conversionUnqualified: getExcludedIdsForTable("conversionUnqualified"),
  }), [getExcludedIdsForTable])

  // These walk every call row, so they must not re-run on unrelated state changes
  const data = useMemo(
    () => (primaryRawData
      ? transformApiData(primaryRawData, selectedEmployees, dashboardType, confirmedTimeRange, excludedIdsForTransform)
      : null),
    [primaryRawData, selectedEmployees, dashboardType, confirmedTimeRange, excludedIdsForTransform]
  )

  const secondaryData = useMemo(
    () => (secondaryRawData
      ? transformApiData(
          {
            settersCallsAggregate: secondaryRawData.secondarySettersCallsAggregate || EMPTY_CALL_AGGREGATE,
            gspCallsAggregate: secondaryRawData.secondaryGspCallsAggregate || EMPTY_CALL_AGGREGATE,
            confirmersCallsAggregate: secondaryRawData.secondaryConfirmersCallsAggregate || EMPTY_CALL_AGGREGATE,
            settersHours: secondaryRawData.secondarySettersHours || EMPTY_ROWS,
            gspHours: secondaryRawData.secondaryGspHours || EMPTY_ROWS,
            confirmersHours: secondaryRawData.secondaryConfirmersHours || EMPTY_ROWS,
            settersScorecards: secondaryRawData.secondarySettersScorecards || EMPTY_ROWS,
            confirmersScorecards: secondaryRawData.secondaryConfirmersScorecards || EMPTY_ROWS,
            settersAppointments: secondaryRawData.secondarySettersAppointments || EMPTY_ROWS,
            stl: EMPTY_ROWS, // STL is team-wide, not needed for secondary metrics
          },
          selectedEmployees,
          dashboardType,
          secondaryConfirmedTimeRange,
          excludedIdsForTransform
        )
      : null),
    [secondaryRawData, selectedEmployees, dashboardType, secondaryConfirmedTimeRange, excludedIdsForTransform]
  )
  
  // Auto-select dashboard tab based on available data (only for agents, and only on initial load)
  const [hasAutoSelectedTab, setHasAutoSelectedTab] = useState(false)
  useEffect(() => {
    if (!rawData || hasAutoSelectedTab || hasTeamView) return
    
    const hasCalls = (key: string) => (rawData[key]?.buckets?.length ?? 0) > 0
    const hasSettersData = hasCalls('settersCallsAggregate') || (rawData.settersHours?.length > 0)
    const hasGspData = hasCalls('gspCallsAggregate') || (rawData.gspHours?.length > 0)
    const hasConfirmersData = hasCalls('confirmersCallsAggregate') || (rawData.confirmersHours?.length > 0)
    
    // Auto-select the first tab that has data
    if (hasSettersData) {
      setDashboardType('setters')
    } else if (hasConfirmersData) {
      setDashboardType('confirmers')
    } else if (hasGspData) {
      setDashboardType('gsp')
    }
    
    setHasAutoSelectedTab(true)
  }, [rawData, hasAutoSelectedTab, hasTeamView])

  // Get unique employees from the appropriate calls array or hours array based on dashboard type
  const availableEmployees = useMemo(() => rawData ? (() => {
    const uniqueEmployees = new Set<string>()
    const callsKey = isSetterLikeTab(dashboardType)
      ? (dashboardType === 'gsp' ? 'gspCalls' : 'settersCalls')
      : 'confirmersCalls'
    const hoursKey = dashboardType === 'gsp' ? 'gspHours' : dashboardType === 'setters' ? 'settersHours' : 'confirmersHours'
    const aggregate: CallAggregate = rawData[`${callsKey}Aggregate`] || EMPTY_CALL_AGGREGATE
    const hours = rawData[hoursKey] || []
    aggregate.employeeNames.forEach((name) => {
      if (name) {
        uniqueEmployees.add(name)
      }
    })
    hours.forEach((h: any) => {
      if (h.employee) {
        uniqueEmployees.add(h.employee)
      }
    })
    return Array.from(uniqueEmployees).sort()
  })() : [], [rawData, dashboardType])

  // Auto-reset employee filter if selected employees don't exist in current data
  useEffect(() => {
    if (selectedEmployees.length > 0 && availableEmployees.length > 0) {
      const validEmployees = selectedEmployees.filter(emp => availableEmployees.includes(emp))
      if (validEmployees.length !== selectedEmployees.length) {
        setSelectedEmployees(validEmployees)
      }
    }
  }, [rawData, selectedEmployees, dashboardType, availableEmployees])

  // Clear custom dates when switching away from "Custom Dates" option
  useEffect(() => {
    if (timePeriod !== 'Custom Dates') {
      setCustomDateRange({ from: undefined, to: undefined })
      setConfirmedDateRange({ from: undefined, to: undefined })
      setCustomTimeRange({ startHour: undefined, endHour: undefined })
      setConfirmedTimeRange({ startHour: undefined, endHour: undefined })
    }
  }, [timePeriod])

  // Clear secondary custom dates when switching away from "Custom Dates" option
  useEffect(() => {
    if (secondaryTimePeriod !== 'Custom Dates') {
      setSecondaryCustomDateRange({ from: undefined, to: undefined })
      setSecondaryConfirmedDateRange({ from: undefined, to: undefined })
      setSecondaryCustomTimeRange({ startHour: undefined, endHour: undefined })
      setSecondaryConfirmedTimeRange({ startHour: undefined, endHour: undefined })
    }
  }, [secondaryTimePeriod])

  // Save filters to localStorage when they change (debounced)
  useEffect(() => {
    if (!filtersLoaded) return // Don't save until initial load is complete

    const timeoutId = setTimeout(() => {
      const serialized = serializeFilterState(
        selectedEmployees,
        timePeriod,
        dashboardType,
        confirmedDateRange,
        confirmedTimeRange,
        secondaryTimePeriod,
        secondaryConfirmedDateRange,
        secondaryConfirmedTimeRange,
        selectedCallBucketsQualified,
        selectedCallBucketsUnqualified
      )
      FilterStorage.saveFilters(serialized)
    }, 500) // Debounce by 500ms

    return () => clearTimeout(timeoutId)
  }, [
    filtersLoaded,
    selectedEmployees,
    timePeriod,
    dashboardType,
    confirmedDateRange,
    confirmedTimeRange,
    secondaryTimePeriod,
    secondaryConfirmedDateRange,
    secondaryConfirmedTimeRange,
    selectedCallBucketsQualified,
    selectedCallBucketsUnqualified,
  ])

  const handleDateRangeOk = () => {
    if (customDateRange.from && customDateRange.to) {
      setConfirmedDateRange(customDateRange)
      setConfirmedTimeRange(customTimeRange)
      setDatePickerOpen(false)
      setMobilePickerOpen(false)
    }
  }

  const handleDateRangeReset = () => {
    setCustomDateRange({ from: undefined, to: undefined })
    setConfirmedDateRange({ from: undefined, to: undefined })
    setCustomTimeRange({ startHour: undefined, endHour: undefined })
    setConfirmedTimeRange({ startHour: undefined, endHour: undefined })
  }

  const handleSecondaryDateRangeOk = () => {
    if (secondaryCustomDateRange.from && secondaryCustomDateRange.to) {
      setSecondaryConfirmedDateRange(secondaryCustomDateRange)
      setSecondaryConfirmedTimeRange(secondaryCustomTimeRange)
      setSecondaryDatePickerOpen(false)
      setSecondaryMobilePickerOpen(false)
    }
  }

  const handleSecondaryDateRangeReset = () => {
    setSecondaryCustomDateRange({ from: undefined, to: undefined })
    setSecondaryConfirmedDateRange({ from: undefined, to: undefined })
    setSecondaryCustomTimeRange({ startHour: undefined, endHour: undefined })
    setSecondaryConfirmedTimeRange({ startHour: undefined, endHour: undefined })
  }

  const getGaugeColor = (value: number, thresholds: number[]) => {
    if (value < thresholds[0]) return "#ef4444" // red
    if (value < thresholds[1]) return "#f97316" // orange
    if (value < thresholds[2]) return "#eab308" // gold
    if (value < thresholds[3]) return "#22c55e" // green
    return "#3b82f6" // blue
  }

  // For metrics where LOWER is better (like checkout to dial time)
  const getInverseGaugeColor = (value: number, thresholds: number[]) => {
    if (value >= thresholds[0]) return "#ef4444" // red (90+)
    if (value >= thresholds[1]) return "#f97316" // orange (60-89)
    if (value >= thresholds[2]) return "#eab308" // gold (45-59)
    if (value >= thresholds[3]) return "#22c55e" // green (30-44)
    return "#3b82f6" // blue (0-29)
  }


  // Filter STL data by time range if provided
  const filteredStlData = rawData && rawData.stl ? (() => {
    if (timePeriod === 'Custom Dates' && confirmedTimeRange && (confirmedTimeRange.startHour !== undefined || confirmedTimeRange.endHour !== undefined)) {
      return rawData.stl.filter((stl: any) => {
        if (!stl.callDate) return false
        const hour = extractHourFromDateString(stl.callDate)
        return isHourInTimeRange(hour, confirmedTimeRange.startHour, confirmedTimeRange.endHour)
      })
    }
    return rawData.stl
  })() : []

  // Helper function to filter calls by time range and employees
  const getFilteredCalls = useCallback((calls: any[]) => {
    // Filter by time range if provided (only when using Custom Dates)
    let timeFilteredCalls = calls
    if (timePeriod === 'Custom Dates' && confirmedTimeRange && (confirmedTimeRange.startHour !== undefined || confirmedTimeRange.endHour !== undefined)) {
      timeFilteredCalls = calls.filter((call: any) => {
        if (!call.date) return false
        const hour = extractHourFromDateString(call.date)
        return isHourInTimeRange(hour, confirmedTimeRange.startHour, confirmedTimeRange.endHour)
      })
    }
    
    // Filter by employee if employees are selected
    let filteredCalls = timeFilteredCalls
    if (selectedEmployees.length > 0) {
      filteredCalls = timeFilteredCalls.filter((call: any) => selectedEmployees.includes(call.employee))
    }
    
    return filteredCalls
  }, [timePeriod, confirmedTimeRange, selectedEmployees])

  // Helper to filter calls by secondary time range, optional call buckets, and employees (for performance metrics)
  const getFilteredSecondaryCallsWithBuckets = useCallback((calls: any[], selectedBuckets: string[]) => {
    let timeFilteredCalls = calls
    if (secondaryTimePeriod === 'Custom Dates' && secondaryConfirmedTimeRange && (secondaryConfirmedTimeRange.startHour !== undefined || secondaryConfirmedTimeRange.endHour !== undefined)) {
      timeFilteredCalls = calls.filter((call: any) => {
        if (!call.date) return false
        const hour = extractHourFromDateString(call.date)
        return isHourInTimeRange(hour, secondaryConfirmedTimeRange.startHour, secondaryConfirmedTimeRange.endHour)
      })
    }
    if (selectedBuckets.length > 0 && !selectedBuckets.includes('all')) {
      const hasNone = selectedBuckets.includes('none')
      const ids = new Set(selectedBuckets.filter((v) => v !== 'none').map((v) => Number(v)))
      timeFilteredCalls = timeFilteredCalls.filter((c: any) => {
        const noBucket = !c.cqd_id || c.cqd_id === 0
        if (noBucket) return hasNone
        return ids.has(Number(c.cqd_id))
      })
    }
    if (selectedEmployees.length > 0) {
      timeFilteredCalls = timeFilteredCalls.filter((call: any) => selectedEmployees.includes(call.employee))
    }
    return timeFilteredCalls
  }, [secondaryTimePeriod, secondaryConfirmedTimeRange, selectedEmployees])

  // The drill-down tables below read rows fetched on demand for whichever table is
  // open. The server already applies each table's row predicate and column set, so
  // only the dashboard's own hour / employee / call-bucket filters are applied here.
  const rowsForOpenTable = (table: DrilldownTable) => (openDrilldown === table ? drilldownRows : EMPTY_ROWS)

  // All calls, for the connection and dials per hour data tables
  const filteredAllCalls = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return EMPTY_ROWS
    if (openDrilldown !== 'connection' && openDrilldown !== 'dialsPerHour') return EMPTY_ROWS
    return getFilteredCalls(drilldownRows)
  }, [dashboardType, openDrilldown, drilldownRows, getFilteredCalls])

  // Connected calls, for the pitch data table
  const filteredConnectedCalls = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return EMPTY_ROWS
    return getFilteredCalls(rowsForOpenTable('pitch')).map((call: any) => ({
      employee: call.employee || '',
      date: call.date || null,
      connected: call.connected || 0,
      pitched: call.pitched || 0,
      id: call.id ?? null,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, openDrilldown, drilldownRows, getFilteredCalls])

  // Pitched calls, for the conversion data table
  const filteredPitchedCalls = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return EMPTY_ROWS
    return getFilteredCalls(rowsForOpenTable('conversion')).map((call: any) => ({
      employee: call.employee || '',
      date: call.date || null,
      pitched: call.pitched || 0,
      positive: call.positive || 0,
      qualified: call.qualified ?? null,
      id: call.id ?? null, // Use call.id as customer ID
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, openDrilldown, drilldownRows, getFilteredCalls])

  const toSecondaryConversionRow = (call: any) => ({
    employee: call.employee || '',
    date: call.date || null,
    pitched: call.pitched || 0,
    positive: call.positive || 0,
    qualified: call.qualified ?? null,
    id: call.id ?? null,
    lds_id: call.lds_id ?? null,
    cst_id: call.cst_id ?? null,
    cqd_id: call.cqd_id ?? null,
  })

  // Pitched calls for Conversion % (Qualified) — secondary window + qualified call bucket filter
  const filteredSecondaryPitchedCallsForQualified = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return EMPTY_ROWS
    const rows = rowsForOpenTable('conversionQualified')
    return getFilteredSecondaryCallsWithBuckets(rows, selectedCallBucketsQualified).map(toSecondaryConversionRow)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, openDrilldown, drilldownRows, getFilteredSecondaryCallsWithBuckets, selectedCallBucketsQualified])

  // Pitched calls for Conversion % (Un-Qualified) — secondary window + unqualified call bucket filter
  const filteredSecondaryPitchedCallsForUnqualified = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return EMPTY_ROWS
    const rows = rowsForOpenTable('conversionUnqualified')
    return getFilteredSecondaryCallsWithBuckets(rows, selectedCallBucketsUnqualified).map(toSecondaryConversionRow)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardType, openDrilldown, drilldownRows, getFilteredSecondaryCallsWithBuckets, selectedCallBucketsUnqualified])

  // Conversion % (Qualified) and (Un-Qualified) cards. These carry their own call
  // bucket filter, so they are summed from the aggregate rather than from the
  // drill-down rows, which only exist while a table is open.
  const secondaryCallAggregate: CallAggregate = useMemo(
    () => (secondaryRawData
      ? secondaryRawData[dashboardType === 'gsp' ? 'secondaryGspCallsAggregate' : 'secondarySettersCallsAggregate'] || EMPTY_CALL_AGGREGATE
      : EMPTY_CALL_AGGREGATE),
    [secondaryRawData, dashboardType]
  )

  const conversionQualifiedMetricValue = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return 0
    const { totals } = summarizeCallAggregate(
      secondaryCallAggregate, selectedEmployees, secondaryConfirmedTimeRange, selectedCallBucketsQualified
    )
    return totals.qualified > 0 ? Math.round((totals.qualifiedConversions / totals.qualified) * 100) : 0
  }, [dashboardType, secondaryCallAggregate, selectedEmployees, secondaryConfirmedTimeRange, selectedCallBucketsQualified])

  const conversionUnqualifiedMetricValue = useMemo(() => {
    if (!isSetterLikeTab(dashboardType)) return 0
    const { totals } = summarizeCallAggregate(
      secondaryCallAggregate, selectedEmployees, secondaryConfirmedTimeRange, selectedCallBucketsUnqualified
    )
    return totals.unqualified > 0 ? Math.round((totals.unqualifiedConversions / totals.unqualified) * 100) : 0
  }, [dashboardType, secondaryCallAggregate, selectedEmployees, secondaryConfirmedTimeRange, selectedCallBucketsUnqualified])

  // Filter appointments for gross issue data table using secondary date range
  // Unfiltered appointments for GrossIssueDataTable (so it can show all employees in filter)
  const allSecondaryGrossIssueAppointments = useMemo(() => rawData ? (() => {
    if (!isSetterLikeTab(dashboardType)) return []
    
    const appointmentsKey = 'secondarySettersAppointments'
    const allAppointments = rawData[appointmentsKey] || []
    
    // Transform to GrossIssueDataTable format (unfiltered - let the component handle filtering)
    return allAppointments.map((apt: any) => ({
      employee: apt.employee || '',
      date: apt.date || null,
      ApptSet: apt.ApptSet ?? null,
      Issued: apt.Issued ?? null,
      NetIssued: apt.NetIssued ?? null,
      id: apt.id ?? null,
      lds_id: apt.lds_id ?? null,
      cst_id: apt.cst_id ?? null,
      dsp_id: apt.dsp_id ?? null,
      Productid: apt.Productid ?? null,
      SourceCode: apt.SourceCode ?? null,
      Descr: apt.Descr ?? null,
    }))
  })() : [], [rawData, dashboardType])

  // Filtered appointments for other uses (if needed)
  const filteredSecondaryGrossIssueAppointments = useMemo(
    () => (selectedEmployees.length > 0
      ? allSecondaryGrossIssueAppointments.filter((apt: any) => selectedEmployees.includes(apt.employee))
      : allSecondaryGrossIssueAppointments),
    [allSecondaryGrossIssueAppointments, selectedEmployees]
  )

  // Build the scorecard data table source. Setters use the secondary (performance window)
  // bucket because the Setters Scorecard gauge lives in the secondary block; Confirmers use
  // the primary bucket because the Scorecard gauge is a primary metric there.
  const scorecardTableData: ScorecardRecord[] = useMemo(() => {
    if (!rawData) return []
    const sourceKey =
      dashboardType === 'confirmers'
        ? 'confirmersScorecards'
        : dashboardType === 'setters'
          ? 'secondarySettersScorecards'
          : null
    if (!sourceKey) return []
    const list: any[] = rawData[sourceKey] || []
    const filtered = selectedEmployees.length > 0
      ? list.filter((sc: any) => selectedEmployees.includes(sc.employee))
      : list
    return filtered.map((sc: any) => ({
      id: sc.id ?? null,
      form_instance_id: sc.form_instance_id ?? sc.id ?? null,
      form_id: sc.form_id ?? null,
      status: sc.status ?? null,
      callDate: sc.callDate ?? null,
      employee: sc.employee ?? null,
      maxTotal: Number(sc.maxTotal ?? 0),
      actualTotal: Number(sc.actualTotal ?? 0),
      score: Number(sc.score ?? 0),
      items: Array.isArray(sc.items) ? sc.items : [],
      variables: sc.variables ?? null,
      linkedCall: sc.linkedCall ?? null,
    }))
  }, [rawData, dashboardType, selectedEmployees])

  // Transform all calls for connection and dials per hour data tables
  const connectionTableData = filteredAllCalls.map((call: any) => ({
    employee: call.employee || '',
    date: call.date || null,
    connected: call.connected || 0,
    id: call.id ?? null,
  }))

  const dialsPerHourTableData = filteredAllCalls.map((call: any) => ({
    employee: call.employee || '',
    date: call.date || null,
    result: call.result || null,
    id: call.id ?? null,
  }))

  // Build available record IDs for filtering excluded records panel
  // The panel only ever intersects these sets with the excluded records, so the
  // excluded calls the server found in each window are sufficient — and mean we
  // don't need every raw row loaded just to render an accurate count.
  const availableRecordIdsForPanel = useMemo(() => {
    const primaryAggregate: CallAggregate = primaryRawData
      ? primaryRawData[dashboardType === 'gsp' ? 'gspCallsAggregate' : isSetterLikeTab(dashboardType) ? 'settersCallsAggregate' : 'confirmersCallsAggregate'] || EMPTY_CALL_AGGREGATE
      : EMPTY_CALL_AGGREGATE

    const primaryExcluded = getFilteredCalls(primaryAggregate.excludedRows ?? EMPTY_ROWS)
    const secondaryExcludedQualified = getFilteredSecondaryCallsWithBuckets(
      secondaryCallAggregate.excludedRows ?? EMPTY_ROWS, selectedCallBucketsQualified
    )
    const secondaryExcludedUnqualified = getFilteredSecondaryCallsWithBuckets(
      secondaryCallAggregate.excludedRows ?? EMPTY_ROWS, selectedCallBucketsUnqualified
    )
    const idsOf = (rows: any[], predicate?: (row: any) => boolean) =>
      new Set<string>(
        rows
          .filter((r: any) => r.id != null && (!predicate || predicate(r)))
          .map((r: any) => String(r.id))
      )

    return {
      stl: new Set<string>(filteredStlData.filter((r: any) => r.leadId != null).map((r: any) => String(r.leadId))),
      connection: idsOf(primaryExcluded),
      dialsPerHour: idsOf(primaryExcluded),
      pitch: idsOf(primaryExcluded, (r) => r.connected === 1),
      conversion: idsOf(primaryExcluded, (r) => r.pitched === 1),
      conversionQualified: idsOf(secondaryExcludedQualified, (r) => r.pitched === 1),
      conversionUnqualified: idsOf(secondaryExcludedUnqualified, (r) => r.pitched === 1),
      grossIssue: new Set<string>(filteredSecondaryGrossIssueAppointments.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    }
  }, [
    primaryRawData, dashboardType, secondaryCallAggregate, filteredStlData,
    filteredSecondaryGrossIssueAppointments, getFilteredCalls, getFilteredSecondaryCallsWithBuckets,
    selectedCallBucketsQualified, selectedCallBucketsUnqualified,
  ])

  // Count excluded records that are relevant to the current time range
  const relevantExcludedCount = excludedRecords.filter((record) => {
    const availableIds = availableRecordIdsForPanel[record.tableType as keyof typeof availableRecordIdsForPanel]
    if (!availableIds) return true
    return availableIds.has(record.recordId)
  }).length

  // Calculate total hours for dials per hour metric (same logic as in transformApiData)
  const totalHoursForDialsPerHour = useMemo(() => rawData ? (() => {
    if (!isSetterLikeTab(dashboardType) || dashboardType === 'gsp') return 0
    
    const hoursKey = 'settersHours'
    let filteredHours = rawData[hoursKey] || []
    
    // Filter by employee if employees are selected
    if (selectedEmployees.length > 0) {
      filteredHours = filteredHours.filter((h: any) => selectedEmployees.includes(h.employee))
    }
    
    // Create a map of hours by employee name
    const hoursByEmployee = new Map<string, number>()
    filteredHours.forEach((h: any) => {
      if (h.employee) {
        let adjustedHours = h.hours || 0
        
        // Adjust hours based on time range if provided (only when using Custom Dates)
        if (timePeriod === 'Custom Dates' && confirmedTimeRange && (confirmedTimeRange.startHour !== undefined || confirmedTimeRange.endHour !== undefined)) {
          const hoursInRange = calculateHoursInTimeRange(confirmedTimeRange.startHour, confirmedTimeRange.endHour)
          adjustedHours = hoursInRange
        }
        
        hoursByEmployee.set(h.employee, adjustedHours)
      }
    })
    
    // Calculate total hours
    return Array.from(hoursByEmployee.values()).reduce((sum: number, hours: number) => sum + hours, 0)
  })() : 0, [rawData, dashboardType, selectedEmployees, timePeriod, confirmedTimeRange])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Failed to load dashboard data</p>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => mutate()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { employees, settersMetrics, confirmersMetrics } = data || {
    employees: [],
    settersMetrics: {
      dialsPerHour: 0,
      connectionRate: 0,
      pitchRate: 0,
      conversionRate: 0,
      horsepower: 0,
      skillScore: 0,
      scoreCard: 0,
      conversionQualified: 0,
      conversionUnqualified: 0,
      grossIssue: 0,
      checkoutToDialTime: 0,
    },
    confirmersMetrics: {
      contactRate: 0,
      grossIssueRate: 0,
      netIssueRate: 0,
      oneLegsRate: 0,
      scorecard: 0,
    },
  }
  
  // Presence checks read the aggregate's employee list instead of scanning rows
  const hasCallsOrHoursFor = (aggregateKey: string, hoursKey: string) => {
    if (!rawData) return false
    const aggregate: CallAggregate = rawData[aggregateKey] || EMPTY_CALL_AGGREGATE
    const hours = rawData[hoursKey] || []
    if (selectedEmployees.length > 0) {
      return aggregate.employeeNames.some((name) => selectedEmployees.includes(name)) ||
             hours.some((h: any) => selectedEmployees.includes(h.employee))
    }
    return aggregate.buckets.length > 0 || hours.length > 0
  }

  // Determine if there's actual data for the current dashboard type
  const hasDataForCurrentDashboard = isSetterLikeTab(dashboardType)
    ? hasCallsOrHoursFor(
        dashboardType === 'gsp' ? 'gspCallsAggregate' : 'settersCallsAggregate',
        dashboardType === 'gsp' ? 'gspHours' : 'settersHours'
      )
    : dashboardType === 'confirmers'
      ? hasCallsOrHoursFor('confirmersCallsAggregate', 'confirmersHours')
      : undefined

  // Determine if there's actual data for the secondary (Performance Metrics) dashboard
  const hasDataForSecondaryDashboard = isSetterLikeTab(dashboardType)
    ? hasCallsOrHoursFor(
        dashboardType === 'gsp' ? 'secondaryGspCallsAggregate' : 'secondarySettersCallsAggregate',
        dashboardType === 'gsp' ? 'secondaryGspHours' : 'secondarySettersHours'
      )
    : hasCallsOrHoursFor('secondaryConfirmersCallsAggregate', 'secondaryConfirmersHours')

  return (
    <div className="min-h-screen bg-background">
      {/* Session Warning */}
      <SessionWarning />
      {isDemoUser && <DemoBanner />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <h1 className="text-lg font-bold tracking-tight md:text-2xl">Call Center Dashboard</h1>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Utility Actions - Always Visible */}
            <div className="flex items-center gap-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="h-9 w-9"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => mutate()} 
                title="Refresh"
                className="h-9 w-9"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Visual Separator */}
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* User Menu - Works on all screen sizes */}
            <UserMenu 
              onExcludedRecordsClick={() => setExcludedRecordsPanelOpen(true)}
              excludedRecordsCount={relevantExcludedCount}
            />
          </div>
        </div>
      </header>


      <main className="container mx-auto p-6">
        {/* Combined Filters and Toggle */}
        <Card className="mb-4 p-3 bg-transparent shadow-none border-none dark:shadow-none dark:border-none">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Button
                variant={dashboardType === "setters" ? "default" : "outline"}
                onClick={() => setDashboardType("setters")}
                size="sm"
                className="min-w-[120px] dark:border-white/10"
              >
                {isAgent ? "Setter" : "Setters"}
              </Button>
              <Button
                variant={dashboardType === "confirmers" ? "default" : "outline"}
                onClick={() => setDashboardType("confirmers")}
                size="sm"
                className="min-w-[120px] dark:border-white/10"
              >
                {isAgent ? "Confirmer" : "Confirmers"}
              </Button>
              <Button
                variant={dashboardType === "gsp" ? "default" : "outline"}
                onClick={() => setDashboardType("gsp")}
                size="sm"
                className="min-w-[120px] dark:border-white/10"
              >
                GSP
              </Button>
            </div>
            <div className="flex gap-2 items-center justify-evenly md:justify-start">
              {isPrimaryRefreshing && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Updating…
                </span>
              )}
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="h-9 dark:border-white/10 bg-white dark:bg-transparent w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="Yesterday">Yesterday</SelectItem>
                  <SelectItem value="Rolling 7 Days">Rolling 7 Days</SelectItem>
                  <SelectItem value="This Week (Sun-Sat)">This Week</SelectItem>
                  <SelectItem value="Last Week (Sun-Sat)">Last Week</SelectItem>
                  <SelectItem value="Rolling 30 Days">Rolling 30 Days</SelectItem>
                  <SelectItem value="This Month to Date">This Month to Date</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="Year to Date">Year to Date</SelectItem>
                  <SelectItem value="Custom Dates">Custom Dates</SelectItem>
                </SelectContent>
              </Select>
              {timePeriod === "Custom Dates" && (
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="hidden md:flex h-9 dark:border-white/10 bg-white dark:bg-transparent font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRangeButtonText(confirmedDateRange.from, confirmedDateRange.to, confirmedTimeRange)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={(range) => {
                        if (range) {
                          setCustomDateRange(range)
                        }
                      }}
                      numberOfMonths={2}
                      showOutsideDays={false}
                      disabled={(date) => date > new Date()}
                    />
                    <div className="p-3 border-t space-y-3">
                      <div className="flex items-center justify-start gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
                          <Select
                            value={customTimeRange.startHour === undefined ? "all-day" : customTimeRange.startHour.toString()}
                            onValueChange={(value) => {
                              setCustomTimeRange(prev => ({
                                ...prev,
                                startHour: value === "all-day" ? undefined : parseInt(value)
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generateHourOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">End Time</label>
                          <Select
                            value={customTimeRange.endHour === undefined ? "all-day" : customTimeRange.endHour.toString()}
                            onValueChange={(value) => {
                              setCustomTimeRange(prev => ({
                                ...prev,
                                endHour: value === "all-day" ? undefined : parseInt(value)
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generateHourOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDateRangeReset}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleDateRangeOk}
                          disabled={
                            !customDateRange.from || 
                            !customDateRange.to || 
                            (customTimeRange.startHour !== undefined && customTimeRange.endHour === undefined) ||
                            (customTimeRange.endHour !== undefined && customTimeRange.startHour === undefined) ||
                            (customTimeRange.startHour !== undefined && customTimeRange.endHour !== undefined && customTimeRange.startHour > customTimeRange.endHour && customTimeRange.endHour !== 0)
                          }
                        >
                          Ok
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {hasTeamView && (
                <Popover open={employeeSelectOpen} onOpenChange={setEmployeeSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 dark:border-white/10 bg-white dark:bg-transparent w-[140px] justify-between font-normal">
                      <span className="truncate text-left flex-1">{formatEmployeeSelectionText(selectedEmployees)}</span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="p-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                      <Checkbox
                        checked={selectedEmployees.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([])
                            setEmployeeSelectOpen(false)
                          }
                        }}
                      />
                      <label 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        onClick={() => {
                          setSelectedEmployees([])
                          setEmployeeSelectOpen(false)
                        }}
                      >
                        All Employees
                      </label>
                    </div>
                    {availableEmployees.map((employeeName: string) => (
                      <div
                        key={employeeName}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
                      >
                        <Checkbox
                          checked={selectedEmployees.includes(employeeName)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees([...selectedEmployees, employeeName])
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(emp => emp !== employeeName))
                            }
                          }}
                        />
                        <label 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          onClick={() => {
                            if (selectedEmployees.includes(employeeName)) {
                              setSelectedEmployees(selectedEmployees.filter(emp => emp !== employeeName))
                            } else {
                              setSelectedEmployees([...selectedEmployees, employeeName])
                            }
                          }}
                        >
                          {employeeName}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              )}
            </div>
            {timePeriod === "Custom Dates" && (
                <Popover open={mobilePickerOpen} onOpenChange={setMobilePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex md:hidden h-9 dark:border-white/10 bg-white dark:bg-transparent font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRangeButtonText(confirmedDateRange.from, confirmedDateRange.to, confirmedTimeRange)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={(range) => {
                        if (range) {
                          setCustomDateRange(range)
                        }
                      }}
                      numberOfMonths={1}
                      showOutsideDays={false}
                      disabled={(date) => date > new Date()}
                    />
                    <div className="p-3 border-t space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
                          <Select
                            value={customTimeRange.startHour === undefined ? "all-day" : customTimeRange.startHour.toString()}
                            onValueChange={(value) => {
                              setCustomTimeRange(prev => ({
                                ...prev,
                                startHour: value === "all-day" ? undefined : parseInt(value)
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generateHourOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">End Time</label>
                          <Select
                            value={customTimeRange.endHour === undefined ? "all-day" : customTimeRange.endHour.toString()}
                            onValueChange={(value) => {
                              setCustomTimeRange(prev => ({
                                ...prev,
                                endHour: value === "all-day" ? undefined : parseInt(value)
                              }))
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generateHourOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDateRangeReset}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleDateRangeOk}
                          disabled={
                            !customDateRange.from || 
                            !customDateRange.to || 
                            (customTimeRange.startHour !== undefined && customTimeRange.endHour === undefined) ||
                            (customTimeRange.endHour !== undefined && customTimeRange.startHour === undefined) ||
                            (customTimeRange.startHour !== undefined && customTimeRange.endHour !== undefined && customTimeRange.startHour > customTimeRange.endHour && customTimeRange.endHour !== 0)
                          }
                        >
                          Ok
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
          </div>
        </Card>

        {isSetterLikeTab(dashboardType) ? (
          <>
            {/* Featured Metrics — GSP: Horsepower only */}
            {(!data || !hasDataForCurrentDashboard) ? (
              dashboardType === "gsp" ? (
                <div className="mb-4 grid gap-6 grid-cols-1 max-w-xl">
                  <Card className="p-8">
                    <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
                      <h3 className="text-2xl font-bold mb-1">Horsepower</h3>
                      <p className="text-sm text-muted-foreground mb-4">Combined Performance Score</p>
                      <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No data available</p>
                      <p className="text-xs text-muted-foreground mt-1">Select a different date range</p>
                    </div>
                  </Card>
                </div>
              ) : (
              <div className="mb-4 grid gap-6 grid-cols-1 sm:grid-cols-2">
                {[
                  { title: "Horsepower", subtitle: "Combined Performance Score" },
                  { title: "Checkout to Dial Time", subtitle: "Team Metric • Speed" }
                ].map((metric, i) => (
                  <Card key={i} className="p-8">
                    <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
                      <h3 className="text-2xl font-bold mb-1">{metric.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{metric.subtitle}</p>
                      <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No data available</p>
                      <p className="text-xs text-muted-foreground mt-1">Select a different date range</p>
                    </div>
                  </Card>
                ))}
              </div>
              )
            ) : (
              dashboardType === "gsp" ? (
                <div className="mb-4 grid gap-6 grid-cols-1 max-w-xl">
                <FeaturedMetricCard
                  title="Horsepower"
                  value={settersMetrics.horsepower}
                  unit="HP"
                  color={getGaugeColor(settersMetrics.horsepower, [35, 44, 56, 72])}
                  subtitle="Combined Performance Score"
                  target={56}
                  ranges={[
                    { label: "Bad", min: 0, max: 34, color: "#ef4444" },
                    { label: "Average", min: 35, max: 43, color: "#f97316" },
                    { label: "Good", min: 44, max: 55, color: "#eab308" },
                    { label: "Excellent", min: 56, max: 71, color: "#22c55e" },
                    { label: "Elite", min: 72, color: "#3b82f6" },
                  ]}
                  formula="((Dials - Connected) × 1.2 + ((Connected - Pitched) × 1.5) + ((Pitched - Positive) × 4) + (Positive × 8)) ÷ Total Hours"
                />
                </div>
              ) : (
              <div className="mb-4 grid gap-6 grid-cols-1 sm:grid-cols-2">
                <FeaturedMetricCard
                  title="Horsepower"
                  value={settersMetrics.horsepower}
                  unit="HP"
                  color={getGaugeColor(settersMetrics.horsepower, [35, 44, 56, 72])}
                  subtitle="Combined Performance Score"
                  target={56}
                  ranges={[
                    { label: "Bad", min: 0, max: 34, color: "#ef4444" },
                    { label: "Average", min: 35, max: 43, color: "#f97316" },
                    { label: "Good", min: 44, max: 55, color: "#eab308" },
                    { label: "Excellent", min: 56, max: 71, color: "#22c55e" },
                    { label: "Elite", min: 72, color: "#3b82f6" },
                  ]}
                  formula="((Dials - Connected) × 1.2 + ((Connected - Pitched) × 1.5) + ((Pitched - Positive) × 4) + (Positive × 10)) ÷ Total Hours"
                />
                <FeaturedMetricCard
                  title="Checkout to Dial Time"
                  value={settersMetrics.checkoutToDialTime}
                  unit=""
                  formattedValue={formatSecondsToMinutes(settersMetrics.checkoutToDialTime)}
                  color={getInverseGaugeColor(settersMetrics.checkoutToDialTime, [240, 180, 120, 60])}
                  subtitle="Team Metric • Speed"
                  target={120}
                  inverted={true}
                  showDataIcon={true}
                  onViewData={() => setStlTableOpen(true)}
                  ranges={[
                    { label: "Elite", min: 0, max: 60, color: "#3b82f6" },
                    { label: "Excellent", min: 61, max: 120, color: "#22c55e" },
                    { label: "Good", min: 121, max: 180, color: "#eab308" },
                    { label: "Average", min: 181, max: 240, color: "#f97316" },
                    { label: "Bad", min: 241, color: "#ef4444" },
                  ]}
                  formula="Average STL (checkout to dial time) in seconds"
                />
              </div>
              )
            )}

            {/* Setters Metrics Gauges — GSP: hidden (Horsepower only tab) */}
            {dashboardType !== "gsp" && (
            <>
            {(!data || !hasDataForCurrentDashboard) ? (
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  "Dials Per Hour",
                  "Connection %",
                  "Pitch %",
                  "Conversion %"
                ].map((title, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex flex-col items-center justify-center text-center min-h-[120px]">
                      <h4 className="text-sm font-medium mb-2">{title}</h4>
                      <AlertCircle className="h-5 w-5 mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">No data</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <CircularGauge
                title="Dials Per Hour"
                value={settersMetrics.dialsPerHour}
                max={100}
                target={29}
                color={getGaugeColor(settersMetrics.dialsPerHour, [22, 25, 29, 34])}
                unit=""
                size="small"
                ranges={[
                  { label: "Bad", min: 0, max: 21, color: "#ef4444" },
                  { label: "Average", min: 22, max: 24, color: "#f97316" },
                  { label: "Good", min: 25, max: 28, color: "#eab308" },
                  { label: "Excellent", min: 29, max: 33, color: "#22c55e" },
                  { label: "Elite", min: 34, color: "#3b82f6" },
                ]}
                formula="Total Calls ÷ Total Hours"
                showDataIcon={true}
                onViewData={() => setDialsPerHourTableOpen(true)}
              />
              <CircularGauge
                title="Connection %"
                value={settersMetrics.connectionRate}
                max={100}
                target={19}
                color={getGaugeColor(settersMetrics.connectionRate, [15, 17, 19, 21])}
                unit="%"
                size="small"
                ranges={[
                  { label: "Bad", min: 0, max: 14, color: "#ef4444" },
                  { label: "Average", min: 15, max: 16, color: "#f97316" },
                  { label: "Good", min: 17, max: 18, color: "#eab308" },
                  { label: "Excellent", min: 19, max: 20, color: "#22c55e" },
                  { label: "Elite", min: 21, color: "#3b82f6" },
                ]}
                formula="(Total Connected ÷ Total Calls) × 100"
                showDataIcon={true}
                onViewData={() => setConnectionTableOpen(true)}
              />
              <CircularGauge
                title="Pitch %"
                value={settersMetrics.pitchRate}
                max={100}
                target={75}
                color={getGaugeColor(settersMetrics.pitchRate, [65, 70, 75, 80])}
                unit="%"
                size="small"
                ranges={[
                  { label: "Bad", min: 0, max: 64, color: "#ef4444" },
                  { label: "Average", min: 65, max: 69, color: "#f97316" },
                  { label: "Good", min: 70, max: 74, color: "#eab308" },
                  { label: "Excellent", min: 75, max: 79, color: "#22c55e" },
                  { label: "Elite", min: 80, color: "#3b82f6" },
                ]}
                formula="(Total Pitched ÷ Total Connected) × 100"
                showDataIcon={true}
                onViewData={() => setPitchTableOpen(true)}
              />
              <CircularGauge
                title="Conversion %"
                value={settersMetrics.conversionRate}
                max={100}
                target={33}
                color={getGaugeColor(settersMetrics.conversionRate, [22, 27, 33, 40])}
                unit="%"
                size="small"
                ranges={[
                  { label: "Bad", min: 0, max: 21, color: "#ef4444" },
                  { label: "Average", min: 22, max: 26, color: "#f97316" },
                  { label: "Good", min: 27, max: 32, color: "#eab308" },
                  { label: "Excellent", min: 33, max: 39, color: "#22c55e" },
                  { label: "Elite", min: 40, color: "#3b82f6" },
                ]}
                formula="(Total Positive ÷ Total Pitched) × 100"
                showDataIcon={true}
                onViewData={() => setConversionTableOpen(true)}
              />
            </div>
            )}

            {/* Performance Metrics Section */}
            <div className="mt-8 mb-6">
                {/* Header with Title and Date Range Filter */}
                <Card className="mb-6 p-3 bg-transparent shadow-none border-none dark:shadow-none dark:border-none">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">Performance Metrics</h2>
                        {isSecondaryRefreshing && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Updating…
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        These metrics are best viewed over longer time periods. Default: Rolling 30 Days
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center md:justify-end flex-wrap">
                      <Select value={secondaryTimePeriod} onValueChange={setSecondaryTimePeriod}>
                        <SelectTrigger className="h-9 dark:border-white/10 bg-white dark:bg-transparent w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Today">Today</SelectItem>
                          <SelectItem value="Yesterday">Yesterday</SelectItem>
                          <SelectItem value="Rolling 7 Days">Rolling 7 Days</SelectItem>
                          <SelectItem value="This Week (Sun-Sat)">This Week</SelectItem>
                          <SelectItem value="Last Week (Sun-Sat)">Last Week</SelectItem>
                          <SelectItem value="Rolling 30 Days">Rolling 30 Days</SelectItem>
                          <SelectItem value="This Month to Date">This Month to Date</SelectItem>
                          <SelectItem value="Last Month">Last Month</SelectItem>
                          <SelectItem value="Year to Date">Year to Date</SelectItem>
                          <SelectItem value="Custom Dates">Custom Dates</SelectItem>
                        </SelectContent>
                      </Select>
                      {secondaryTimePeriod === "Custom Dates" && (
                        <Popover open={secondaryDatePickerOpen} onOpenChange={setSecondaryDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="hidden md:flex h-9 dark:border-white/10 bg-white dark:bg-transparent font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formatDateRangeButtonText(secondaryConfirmedDateRange.from, secondaryConfirmedDateRange.to, secondaryConfirmedTimeRange)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={secondaryCustomDateRange}
                              onSelect={(range) => {
                                if (range) {
                                  setSecondaryCustomDateRange(range)
                                }
                              }}
                              numberOfMonths={2}
                              showOutsideDays={false}
                              disabled={(date) => date > new Date()}
                            />
                            <div className="p-3 border-t space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
                                  <Select
                                    value={secondaryCustomTimeRange.startHour === undefined ? "all-day" : secondaryCustomTimeRange.startHour.toString()}
                                    onValueChange={(value) => {
                                      setSecondaryCustomTimeRange(prev => ({
                                        ...prev,
                                        startHour: value === "all-day" ? undefined : parseInt(value)
                                      }))
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {generateHourOptions().map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-muted-foreground mb-1 block">End Time</label>
                                  <Select
                                    value={secondaryCustomTimeRange.endHour === undefined ? "all-day" : secondaryCustomTimeRange.endHour.toString()}
                                    onValueChange={(value) => {
                                      setSecondaryCustomTimeRange(prev => ({
                                        ...prev,
                                        endHour: value === "all-day" ? undefined : parseInt(value)
                                      }))
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {generateHourOptions().map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSecondaryDateRangeReset}
                                >
                                  Reset
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSecondaryDateRangeOk}
                                  disabled={
                                    !secondaryCustomDateRange.from || 
                                    !secondaryCustomDateRange.to || 
                                    (secondaryCustomTimeRange.startHour !== undefined && secondaryCustomTimeRange.endHour === undefined) ||
                                    (secondaryCustomTimeRange.endHour !== undefined && secondaryCustomTimeRange.startHour === undefined) ||
                                    (secondaryCustomTimeRange.startHour !== undefined && secondaryCustomTimeRange.endHour !== undefined && secondaryCustomTimeRange.startHour > secondaryCustomTimeRange.endHour && secondaryCustomTimeRange.endHour !== 0)
                                  }
                                >
                                  Ok
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      {secondaryTimePeriod === "Custom Dates" && (
                        <Popover open={secondaryMobilePickerOpen} onOpenChange={setSecondaryMobilePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="flex md:hidden h-9 dark:border-white/10 bg-white dark:bg-transparent font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formatDateRangeButtonText(secondaryConfirmedDateRange.from, secondaryConfirmedDateRange.to, secondaryConfirmedTimeRange)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={secondaryCustomDateRange}
                              onSelect={(range) => {
                                if (range) {
                                  setSecondaryCustomDateRange(range)
                                }
                              }}
                              numberOfMonths={1}
                              showOutsideDays={false}
                              disabled={(date) => date > new Date()}
                            />
                            <div className="p-3 border-t space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-xs text-muted-foreground mb-1 block">Start Time</label>
                                  <Select
                                    value={secondaryCustomTimeRange.startHour === undefined ? "all-day" : secondaryCustomTimeRange.startHour.toString()}
                                    onValueChange={(value) => {
                                      setSecondaryCustomTimeRange(prev => ({
                                        ...prev,
                                        startHour: value === "all-day" ? undefined : parseInt(value)
                                      }))
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {generateHourOptions().map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-muted-foreground mb-1 block">End Time</label>
                                  <Select
                                    value={secondaryCustomTimeRange.endHour === undefined ? "all-day" : secondaryCustomTimeRange.endHour.toString()}
                                    onValueChange={(value) => {
                                      setSecondaryCustomTimeRange(prev => ({
                                        ...prev,
                                        endHour: value === "all-day" ? undefined : parseInt(value)
                                      }))
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {generateHourOptions().map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSecondaryDateRangeReset}
                                >
                                  Reset
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSecondaryDateRangeOk}
                                  disabled={
                                    !secondaryCustomDateRange.from || 
                                    !secondaryCustomDateRange.to || 
                                    (secondaryCustomTimeRange.startHour !== undefined && secondaryCustomTimeRange.endHour === undefined) ||
                                    (secondaryCustomTimeRange.endHour !== undefined && secondaryCustomTimeRange.startHour === undefined) ||
                                    (secondaryCustomTimeRange.startHour !== undefined && secondaryCustomTimeRange.endHour !== undefined && secondaryCustomTimeRange.startHour > secondaryCustomTimeRange.endHour && secondaryCustomTimeRange.endHour !== 0)
                                  }
                                >
                                  Ok
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Performance Metrics Display */}
                {isSecondaryPending ? (
                  <Card className="mb-4 p-6">
                    <div className="flex flex-col items-center justify-center text-center gap-2 min-h-40">
                      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                      <p className="text-sm font-medium">Loading performance metrics…</p>
                      <p className="text-xs text-muted-foreground">
                        {isLongDashboardRange(secondaryTimePeriod)
                          ? 'Year-to-date can take a bit longer. Horsepower metrics above stay available meanwhile.'
                          : 'Fetching the selected performance window.'}
                      </p>
                    </div>
                  </Card>
                ) : secondaryError ? (
                  <Card className="mb-4 p-6">
                    <div className="flex flex-col items-center justify-center text-center gap-2 min-h-40">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-sm font-medium text-destructive">Could not load performance metrics</p>
                      <p className="text-xs text-muted-foreground max-w-md">{secondaryError.message}</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => mutateSecondary()}>
                        Retry
                      </Button>
                    </div>
                  </Card>
                ) : (!secondaryData || !hasDataForSecondaryDashboard) ? (
                  <>
                    {/* Skill Score - Full Width */}
                    <Card className="mb-4 p-4">
                      <div className="flex flex-col items-center justify-center text-center min-h-[120px]">
                        <h4 className="text-sm font-medium mb-2">Skill Score</h4>
                        <AlertCircle className="h-5 w-5 mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">No data</p>
                      </div>
                    </Card>
                    {/* Other Metrics Grid */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        "ScoreCard",
                        "Conversion % (Qualified)",
                        "Conversion % (Un-Qualified)",
                        "Gross Issue"
                      ].map((title, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex flex-col items-center justify-center text-center min-h-[120px]">
                            <h4 className="text-sm font-medium mb-2">{title}</h4>
                            <AlertCircle className="h-5 w-5 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">No data</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Skill Score - Full Width */}
                    <div className="mb-4">
                      <FeaturedMetricCard
                        title="Skill Score"
                        value={secondaryData.settersMetrics.skillScore}
                        unit="pts"
                        color={getGaugeColor(secondaryData.settersMetrics.skillScore, [64, 74, 84, 94])}
                        subtitle="Overall Skill Rating"
                        target={85}
                        ranges={[
                          { label: "Bad", min: 0, max: 64, color: "#ef4444" },
                          { label: "Average", min: 65, max: 74, color: "#f97316" },
                          { label: "Good", min: 75, max: 84, color: "#eab308" },
                          { label: "Excellent", min: 85, max: 94, color: "#22c55e" },
                          { label: "Elite", min: 95, max: 100, color: "#3b82f6" },
                        ]}
                        formula="100 × (0.40 × SCnorm + 0.10 × QCRnorm + 0.30 × UCRnorm + 0.20 × GIRnorm) where SCnorm = SC ÷ 100, QCRnorm = QCR ÷ 100, UCRnorm = UCR ÷ 40, GIRnorm = GIR ÷ 85"
                      />
                    </div>
                    {/* Other Metrics Grid */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <CircularGauge
                        title="ScoreCard"
                        value={secondaryData.settersMetrics.scoreCard}
                        max={100}
                        target={90}
                        color={getGaugeColor(secondaryData.settersMetrics.scoreCard, [59.9, 69.9, 79.9, 89.9])}
                        unit="%"
                        size="small"
                        ranges={[
                          { label: "Bad", min: 0, max: 59.9, color: "#ef4444" },
                          { label: "Average", min: 60, max: 69.9, color: "#f97316" },
                          { label: "Good", min: 70, max: 79.9, color: "#eab308" },
                          { label: "Excellent", min: 80, max: 89.9, color: "#22c55e" },
                          { label: "Elite", min: 90, max: 100, color: "#3b82f6" },
                        ]}
                        formula="(Sum of actualTotals ÷ Sum of maxTotals) × 100"
                        showDataIcon={true}
                        onViewData={() => setScorecardTableOpen(true)}
                      />
                      <CircularGauge
                        title="Conversion % (Qualified)"
                        value={conversionQualifiedMetricValue}
                        max={100}
                        target={85}
                        color={getGaugeColor(conversionQualifiedMetricValue, [64, 74, 84, 94])}
                        unit="%"
                        size="small"
                        ranges={[
                          { label: "Bad", min: 0, max: 64, color: "#ef4444" },
                          { label: "Average", min: 65, max: 74, color: "#f97316" },
                          { label: "Good", min: 75, max: 84, color: "#eab308" },
                          { label: "Excellent", min: 85, max: 94, color: "#22c55e" },
                          { label: "Elite", min: 95, max: 100, color: "#3b82f6" },
                        ]}
                        formula="(Total Qualified ÷ Total Pitched) × 100"
                        showDataIcon={true}
                        onViewData={() => setConversionQualifiedTableOpen(true)}
                      />
                      <CircularGauge
                        title="Conversion % (Un-Qualified)"
                        value={conversionUnqualifiedMetricValue}
                        max={100}
                        target={18}
                        color={getGaugeColor(conversionUnqualifiedMetricValue, [10, 13, 17, 20])}
                        unit="%"
                        size="small"
                        ranges={[
                          { label: "Bad", min: 0, max: 10, color: "#ef4444" },
                          { label: "Average", min: 11, max: 13, color: "#f97316" },
                          { label: "Good", min: 14, max: 17, color: "#eab308" },
                          { label: "Excellent", min: 18, max: 20, color: "#22c55e" },
                          { label: "Elite", min: 21, max: 100, color: "#3b82f6" },
                        ]}
                        formula="(Total Unqualified ÷ Total Pitched) × 100"
                        showDataIcon={true}
                        onViewData={() => setConversionUnqualifiedTableOpen(true)}
                      />
                      <CircularGauge
                        title="Gross Issue"
                        value={secondaryData.settersMetrics.grossIssue}
                        max={100}
                        target={81}
                        color={getGaugeColor(secondaryData.settersMetrics.grossIssue, [70, 75, 81, 85])}
                        unit="%"
                        size="small"
                        ranges={[
                          { label: "Bad", min: 0, max: 69, color: "#ef4444" },
                          { label: "Average", min: 70, max: 74, color: "#f97316" },
                          { label: "Good", min: 75, max: 80, color: "#eab308" },
                          { label: "Excellent", min: 81, max: 84, color: "#22c55e" },
                          { label: "Elite", min: 85, color: "#3b82f6" },
                        ]}
                        formula="(Total Issued ÷ Total ApptSet) × 100"
                        showDataIcon={true}
                        onViewData={() => setGrossIssueTableOpen(true)}
                      />
                    </div>
                  </>
                )}
            </div>
            </>
            )}
          </>
        ) : (
          <>
            {/* Confirmers Metrics Gauges */}
            {(!data || !hasDataForCurrentDashboard) ? (
              <div className="mb-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
                {[
                  "Contact Rate",
                  "Gross Issue Rate",
                  "Net Issue Rate",
                  "1-Leg Rate",
                  "Scorecard"
                ].map((title, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex flex-col items-center justify-center text-center min-h-[120px]">
                      <h4 className="text-sm font-medium mb-2">{title}</h4>
                      <AlertCircle className="h-5 w-5 mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">No data</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mb-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
              <CircularGauge
                title="Contact Rate"
                value={confirmersMetrics.contactRate}
                max={100}
                target={85}
                color={getGaugeColor(confirmersMetrics.contactRate, [74.9, 79.9, 84.9, 89.9])}
                unit="%"
                ranges={[
                  { label: "Bad", min: 0, max: 74.9, color: "#ef4444" },
                  { label: "Average", min: 75, max: 79.9, color: "#f97316" },
                  { label: "Good", min: 80, max: 84.9, color: "#eab308" },
                  { label: "Excellent", min: 85, max: 89.9, color: "#22c55e" },
                  { label: "Elite", min: 90, max: 100, color: "#3b82f6" },
                ]}
              />
              <CircularGauge
                title="Gross Issue Rate"
                value={confirmersMetrics.grossIssueRate}
                max={100}
                target={81}
                color={getGaugeColor(confirmersMetrics.grossIssueRate, [69.9, 74.9, 80.9, 84.9])}
                unit="%"
                ranges={[
                  { label: "Bad", min: 0, max: 69.9, color: "#ef4444" },
                  { label: "Average", min: 70, max: 74.9, color: "#f97316" },
                  { label: "Good", min: 75, max: 80.9, color: "#eab308" },
                  { label: "Excellent", min: 81, max: 84.9, color: "#22c55e" },
                  { label: "Elite", min: 85, max: 100, color: "#3b82f6" },
                ]}
              />
              <CircularGauge
                title="Net Issue Rate"
                value={confirmersMetrics.netIssueRate}
                max={100}
                target={88}
                color={getGaugeColor(confirmersMetrics.netIssueRate, [81.9, 85.9, 87.9, 91.9])}
                unit="%"
                ranges={[
                  { label: "Bad", min: 0, max: 81.9, color: "#ef4444" },
                  { label: "Average", min: 82, max: 85.9, color: "#f97316" },
                  { label: "Good", min: 86, max: 87.9, color: "#eab308" },
                  { label: "Excellent", min: 88, max: 91.9, color: "#22c55e" },
                  { label: "Elite", min: 92, max: 100, color: "#3b82f6" },
                ]}
              />
              <CircularGauge
                title="1-Leg Rate"
                value={confirmersMetrics.oneLegsRate}
                max={100}
                target={80}
                color={getGaugeColor(confirmersMetrics.oneLegsRate, [69.9, 74.9, 79.9, 84.9])}
                unit="%"
                ranges={[
                  { label: "Bad", min: 0, max: 69.9, color: "#ef4444" },
                  { label: "Average", min: 70, max: 74.9, color: "#f97316" },
                  { label: "Good", min: 75, max: 79.9, color: "#eab308" },
                  { label: "Excellent", min: 80, max: 84.9, color: "#22c55e" },
                  { label: "Elite", min: 85, max: 100, color: "#3b82f6" },
                ]}
              />
              <CircularGauge
                title="Scorecard"
                value={confirmersMetrics.scorecard}
                max={100}
                target={80}
                color={getGaugeColor(confirmersMetrics.scorecard, [59.9, 69.9, 79.9, 89.9])}
                unit="%"
                ranges={[
                  { label: "Bad", min: 0, max: 59.9, color: "#ef4444" },
                  { label: "Average", min: 60, max: 69.9, color: "#f97316" },
                  { label: "Good", min: 70, max: 79.9, color: "#eab308" },
                  { label: "Excellent", min: 80, max: 89.9, color: "#22c55e" },
                  { label: "Elite", min: 90, max: 100, color: "#3b82f6" },
                ]}
                formula="(Sum of actualTotals ÷ Sum of maxTotals) × 100"
                showDataIcon={true}
                onViewData={() => setScorecardTableOpen(true)}
              />
            </div>
            )}
          </>
        )}

        {/* GSP Team Members — hours and per-employee horsepower */}
        {dashboardType === "gsp" && (
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">{hasTeamView ? "Team Members" : "Your Stats"}</h2>
          {employees.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium">{hasTeamView ? "No Team Members" : "No Data"}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No {hasTeamView ? "team member" : ""} data available for the selected period
                </p>
              </div>
            </Card>
          ) : (
            <div className={`grid gap-3 ${hasTeamView ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-2"}`}>
              {employees.map((employee) => (
                <EmployeeIndicator
                  key={employee.id}
                  variant="gsp"
                  name={employee.name}
                  hours={employee.hours}
                  horsepower={employee.horsepower}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {/* Employee Indicators — Setters and Confirmers */}
        {dashboardType !== "gsp" && (
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">{hasTeamView ? "Team Members" : "Your Stats"}</h2>
          {employees.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium">{hasTeamView ? "No Team Members" : "No Data"}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No {hasTeamView ? "team member" : ""} data available for the selected period
                </p>
              </div>
            </Card>
          ) : (
            <div className={`grid gap-3 ${hasTeamView ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-2"}`}>
              {employees.map((employee) => (
                <EmployeeIndicator
                  key={employee.id}
                  name={employee.name}
                  dials={employee.dials}
                  connections={employee.connections}
                  pitches={employee.pitches}
                  conversions={employee.conversions}
                  hours={employee.hours}
                  horsepower={dashboardType === 'setters' ? employee.horsepower : undefined}
                />
              ))}
            </div>
          )}
        </div>
        )}
      </main>

      {/* Loading Overlay - Only show on initial load, not when waiting for custom date selection */}
      {/* Full-screen loader is tied to the primary window only; the performance
          section reports its own loading state inline. */}
      {!data && canFetchPrimary && <LoadingScreen />}

      {/* STL Data Table Dialog */}
      {rawData && rawData.stl && (
        <>
          <STLDataTable
            data={filteredStlData}
            open={stlTableOpen}
            onOpenChange={setStlTableOpen}
            excludedIds={getExcludedIdsForTable("stl")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("stl", ids)) : undefined}
          />
        </>
      )}

      {/* Conversion Data Table Dialog */}
      {isSetterLikeTab(dashboardType) && (
        <>
          <ConversionDataTable
            data={filteredPitchedCalls}
            isLoading={isDrilldownPending}
            open={conversionTableOpen}
            onOpenChange={setConversionTableOpen}
            excludedIds={getExcludedIdsForTable("conversion")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("conversion", ids)) : undefined}
          />
          <PitchDataTable
            data={filteredConnectedCalls}
            isLoading={isDrilldownPending}
            open={pitchTableOpen}
            onOpenChange={setPitchTableOpen}
            excludedIds={getExcludedIdsForTable("pitch")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("pitch", ids)) : undefined}
          />
          <ConnectionDataTable
            data={connectionTableData}
            isLoading={isDrilldownPending}
            open={connectionTableOpen}
            onOpenChange={setConnectionTableOpen}
            excludedIds={getExcludedIdsForTable("connection")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("connection", ids)) : undefined}
          />
          <DialsPerHourDataTable
            data={dialsPerHourTableData}
            isLoading={isDrilldownPending}
            totalHours={totalHoursForDialsPerHour}
            open={dialsPerHourTableOpen}
            onOpenChange={setDialsPerHourTableOpen}
            excludedIds={getExcludedIdsForTable("dialsPerHour")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("dialsPerHour", ids)) : undefined}
          />
          <ConversionQualifiedDataTable
            data={filteredSecondaryPitchedCallsForQualified}
            isLoading={isDrilldownPending}
            open={conversionQualifiedTableOpen}
            onOpenChange={setConversionQualifiedTableOpen}
            excludedIds={getExcludedIdsForTable("conversionQualified")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("conversionQualified", ids)) : undefined}
            callQueueDetails={rawData?.callQueueDetails ?? []}
            selectedCallBuckets={selectedCallBucketsQualified}
            onSelectedCallBucketsChange={setSelectedCallBucketsQualified}
          />
          <ConversionUnqualifiedDataTable
            data={filteredSecondaryPitchedCallsForUnqualified}
            isLoading={isDrilldownPending}
            open={conversionUnqualifiedTableOpen}
            onOpenChange={setConversionUnqualifiedTableOpen}
            excludedIds={getExcludedIdsForTable("conversionUnqualified")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("conversionUnqualified", ids)) : undefined}
            callQueueDetails={rawData?.callQueueDetails ?? []}
            selectedCallBuckets={selectedCallBucketsUnqualified}
            onSelectedCallBucketsChange={setSelectedCallBucketsUnqualified}
          />
          <GrossIssueDataTable
            data={allSecondaryGrossIssueAppointments}
            open={grossIssueTableOpen}
            onOpenChange={setGrossIssueTableOpen}
            excludedIds={getExcludedIdsForTable("grossIssue")}
            onExcludeRecords={canExcludeRecords ? ((ids) => excludeRecords("grossIssue", ids)) : undefined}
            timePeriod={secondaryTimePeriod}
            dateRange={secondaryConfirmedDateRange}
            timeRange={secondaryConfirmedTimeRange}
            selectedEmployees={selectedEmployees}
          />
        </>
      )}

      {/* Scorecard Data Table Dialog - available on both Setters (secondary) and Confirmers tabs */}
      {rawData && (dashboardType === 'setters' || dashboardType === 'confirmers') && (
        <ScorecardDataTable
          data={scorecardTableData}
          open={scorecardTableOpen}
          onOpenChange={setScorecardTableOpen}
          title={dashboardType === 'confirmers' ? 'Confirmers Scorecard - Data Table' : 'Setters Scorecard - Data Table'}
          variant={dashboardType === 'confirmers' ? 'confirmers' : 'setters'}
        />
      )}

      {/* Excluded Records Panel - Admin Only */}
      {canExcludeRecords && (
        <ExcludedRecordsPanel
          open={excludedRecordsPanelOpen}
          onOpenChange={setExcludedRecordsPanelOpen}
          excludedRecords={excludedRecords}
          onRestoreRecords={restoreByDocIds}
          loading={excludedRecordsLoading}
          availableRecordIds={availableRecordIdsForPanel}
        />
      )}

    </div>
  )
}
