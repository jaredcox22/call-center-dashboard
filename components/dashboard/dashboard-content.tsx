"use client"

import { useState, useEffect } from "react"
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
import { ExcludedRecordsPanel } from "./excluded-records-panel"
import { useExcludedRecords } from "@/hooks/use-excluded-records"
import { LogOut, RefreshCw, Moon, Sun, Menu, CalendarIcon, AlertCircle, Users, ChevronDown, Ban } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { useActivityTracker } from "@/hooks/use-activity-tracker"
import { SessionWarning } from "@/components/session-warning"
import { LoadingScreen } from "./loading-screen"
import { FilterStorage, FilterState } from "@/lib/filter-storage"
import useSWR from "swr"
import { format } from "date-fns"

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // For CORS with credentials
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  
  return response.json()
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
 * Checks if an hour falls within the time range
 * Range is inclusive of start, exclusive of end (unless end is 0, then it's 24)
 */
const isHourInTimeRange = (hour: number, startHour: number | undefined, endHour: number | undefined): boolean => {
  if (startHour === undefined || endHour === undefined) {
    return true // All Day - include all hours
  }
  
  // Handle edge case: endHour === 0 means midnight (24)
  const effectiveEndHour = endHour === 0 ? 24 : endHour
  
  // Range is inclusive of start, exclusive of end
  return hour >= startHour && hour < effectiveEndHour
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
  dashboardType: "setters" | "confirmers" | "ipp",
  confirmedDateRange: { from: Date | undefined; to?: Date | undefined },
  confirmedTimeRange: { startHour: number | undefined; endHour: number | undefined },
  secondaryTimePeriod: string,
  secondaryConfirmedDateRange: { from: Date | undefined; to?: Date | undefined },
  secondaryConfirmedTimeRange: { startHour: number | undefined; endHour: number | undefined }
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
  }
}

/**
 * Converts storage format to filter state (deserializes dates)
 */
const deserializeFilterState = (stored: FilterState): {
  selectedEmployees: string[]
  timePeriod: string
  dashboardType: "setters" | "confirmers" | "ipp"
  confirmedDateRange: { from: Date | undefined; to?: Date | undefined }
  confirmedTimeRange: { startHour: number | undefined; endHour: number | undefined }
  secondaryTimePeriod: string
  secondaryConfirmedDateRange: { from: Date | undefined; to?: Date | undefined }
  secondaryConfirmedTimeRange: { startHour: number | undefined; endHour: number | undefined }
} => {
  return {
    selectedEmployees: stored.selectedEmployees,
    timePeriod: stored.timePeriod,
    dashboardType: stored.dashboardType,
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
  }
}

const buildApiUrl = (
  dateRange: string, 
  customRange?: { from: Date | undefined; to?: Date | undefined },
  secondaryDateRange?: string,
  secondaryCustomRange?: { from: Date | undefined; to?: Date | undefined }
) => {
  const baseUrl = 'https://api.integrityprodserver.com/dashboards/ccHorsepower.php'
  const params = new URLSearchParams({ dateRange })
  
  if (dateRange === 'Custom Dates' && customRange?.from && customRange?.to) {
    // Start date at beginning of day
    params.append('startDate', format(customRange.from, 'yyyy-MM-dd'))
    
    // End date: add one day to make the range inclusive of the entire selected end date
    const nextDay = new Date(customRange.to)
    nextDay.setDate(nextDay.getDate() + 1)
    params.append('endDate', format(nextDay, 'yyyy-MM-dd'))
  }
  
  // Always add secondary date range (defaults to "Rolling 30 Days" if not provided)
  const effectiveSecondaryDateRange = secondaryDateRange || 'Rolling 30 Days'
  params.append('secondaryDateRange', effectiveSecondaryDateRange)
  
  if (effectiveSecondaryDateRange === 'Custom Dates' && secondaryCustomRange?.from && secondaryCustomRange?.to) {
    params.append('secondaryStartDate', format(secondaryCustomRange.from, 'yyyy-MM-dd'))
    const secondaryNextDay = new Date(secondaryCustomRange.to)
    secondaryNextDay.setDate(secondaryNextDay.getDate() + 1)
    params.append('secondaryEndDate', format(secondaryNextDay, 'yyyy-MM-dd'))
  }
  
  return `${baseUrl}?${params.toString()}`
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
  dashboardType: 'setters' | 'confirmers' | 'ipp',
  timeRange?: { startHour: number | undefined; endHour: number | undefined },
  excludedIds?: ExcludedIdsByTable
) => {
  // Use the appropriate calls array based on dashboard type
  const callsKey = dashboardType === 'setters' ? 'settersCalls' : dashboardType === 'confirmers' ? 'confirmersCalls' : 'ippCalls'
  let allCalls = apiData[callsKey] || []
  
  // Filter out excluded records from calls (using call id)
  // Note: Connection, Pitch, Conversion, DialsPerHour, GrossIssue all share the same call id
  // We use a combined set of all excluded call IDs
  if (excludedIds) {
    const excludedCallIds = new Set([
      ...excludedIds.connection,
      ...excludedIds.pitch,
      ...excludedIds.conversion,
      ...excludedIds.dialsPerHour,
      ...excludedIds.grossIssue,
      ...excludedIds.conversionQualified,
      ...excludedIds.conversionUnqualified,
    ])
    if (excludedCallIds.size > 0) {
      allCalls = allCalls.filter((call: any) => !excludedCallIds.has(String(call.id)))
    }
  }
  
  // Get scorecards based on dashboard type
  const scorecardsKey = dashboardType === 'setters' ? 'settersScorecards' : dashboardType === 'confirmers' ? 'confirmersScorecards' : 'settersScorecards' // IPP doesn't have scorecards yet
  const allScorecards = apiData[scorecardsKey] || []
  
  // Get hours based on dashboard type
  const hoursKey = dashboardType === 'setters' ? 'settersHours' : dashboardType === 'confirmers' ? 'confirmersHours' : 'IPPHours'
  const allHours = apiData[hoursKey] || []
  
  // Keep team-wide STL data (checkout to dial time is a TEAM metric)
  let teamStl = apiData.stl || []
  
  // Filter out excluded STL records (using leadId)
  if (excludedIds && excludedIds.stl.size > 0) {
    teamStl = teamStl.filter((stl: any) => !excludedIds.stl.has(String(stl.leadId)))
  }
  
  // Filter data by time range if provided
  let timeFilteredCalls = allCalls
  if (timeRange && (timeRange.startHour !== undefined || timeRange.endHour !== undefined)) {
    timeFilteredCalls = allCalls.filter((call: any) => {
      if (!call.date) return false
      const hour = extractHourFromDateString(call.date)
      return isHourInTimeRange(hour, timeRange.startHour, timeRange.endHour)
    })
  }
  
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
  let filteredCalls = timeFilteredCalls
  let filteredHours = allHours
  let filteredScorecards = allScorecards
  
  if (selectedEmployees.length > 0) {
    filteredCalls = timeFilteredCalls.filter((call: any) => selectedEmployees.includes(call.employee))
    filteredHours = allHours.filter((h: any) => selectedEmployees.includes(h.employee))
    filteredScorecards = allScorecards.filter((scorecard: any) => selectedEmployees.includes(scorecard.employee))
  }
  
  // Calculate metrics from calls and hours for all dashboard types
  const employees = new Map()
  const callsByEmployee = new Map()
  const hoursByEmployee = new Map<string, number>()
  
  // Aggregate calls by employee
  filteredCalls.forEach((call: any) => {
    if (!callsByEmployee.has(call.employee)) {
      callsByEmployee.set(call.employee, [])
    }
    callsByEmployee.get(call.employee).push(call)
  })
  
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

  // Calculate per-employee stats
  callsByEmployee.forEach((calls, employeeName) => {
    const dials = calls.length
    const connected = calls.filter((c: any) => c.connected === 1).length
    const pitched = calls.filter((c: any) => c.pitched === 1).length
    const positive = calls.filter((c: any) => c.positive === 1).length
    const hours = hoursByEmployee.get(employeeName) || 0
    
    // Calculate horsepower per employee using the same formula as team metric (only for setters)
    const horsepower = dashboardType === 'setters' && dials > 0 && hours > 0
      ? Math.round(
          ((dials - connected) + 
          ((connected - pitched) * 1.5) + 
          ((pitched - positive) * 4) + 
          (positive * 10)) / hours
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
  
  // For IPP dashboard, also add employees from hours even if they have no calls
  if (dashboardType === 'ipp') {
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
  const totalCalls = filteredCalls.length
  const totalConnected = filteredCalls.filter((c: any) => c.connected === 1).length
  const totalPitched = filteredCalls.filter((c: any) => c.pitched === 1).length
  const totalPositive = filteredCalls.filter((c: any) => c.positive === 1).length
  
  // Filter to only pitched calls for qualified/unqualified calculations
  const pitchedCalls = filteredCalls.filter((c: any) => c.pitched === 1)
  const totalQualified = pitchedCalls.filter((c: any) => c.qualified === true).length
  const totalUnqualified = pitchedCalls.filter((c: any) => c.qualified === false).length
  
  // Calculate qualified and unqualified conversions (from pitched calls)
  const totalQualifiedConversions = pitchedCalls.filter((c: any) => c.qualified === true && c.positive === 1).length
  const totalUnqualifiedConversions = pitchedCalls.filter((c: any) => c.qualified === false && c.positive === 1).length
  
  // Get appointments data for gross issue calculation (only for setters dashboard)
  let allAppointments: any[] = []
  let filteredAppointments: any[] = []
  let totalAppointments = 0
  let totalIssuedFromAppointments = 0
  
  if (dashboardType === 'setters') {
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
  const totalApptSet = filteredCalls.filter((c: any) => c.ApptSet != null && c.ApptSet > 0).length
  const totalIssuedFromCalls = filteredCalls.filter((c: any) => c.Issued != null && c.Issued > 0).length
  
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
  const grossIssue = dashboardType === 'setters' 
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
  // - No connection: 1 point per dial
  // - Connected but no pitch: 1.5 points per connection
  // - Pitched but no conversion: 4 points per pitch
  // - Conversion: 10 points per positive
  // Formula: ((Dials - Connected) + ((Connected - Pitched) * 1.5) + ((Pitched - Positive) * 4) + (Positive * 10)) / Total Hours
  const horsepower = totalCalls > 0 && totalHours > 0
    ? Math.round(
        ((totalCalls - totalConnected) + 
        ((totalConnected - totalPitched) * 1.5) + 
        ((totalPitched - totalPositive) * 4) + 
        (totalPositive * 10)) / totalHours
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
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [timePeriod, setTimePeriod] = useState("Today")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false)
  const [dashboardType, setDashboardType] = useState<"setters" | "confirmers" | "ipp">("setters")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
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
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  useEffect(() => {
    const stored = FilterStorage.loadFilters()
    if (stored) {
      const deserialized = deserializeFilterState(stored)
      setSelectedEmployees(deserialized.selectedEmployees)
      setTimePeriod(deserialized.timePeriod)
      setDashboardType(deserialized.dashboardType)
      setConfirmedDateRange(deserialized.confirmedDateRange)
      setConfirmedTimeRange(deserialized.confirmedTimeRange)
      setSecondaryTimePeriod(deserialized.secondaryTimePeriod)
      setSecondaryConfirmedDateRange(deserialized.secondaryConfirmedDateRange)
      setSecondaryConfirmedTimeRange(deserialized.secondaryConfirmedTimeRange)
    }
    setFiltersLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Only build API URL if we have complete date range for custom dates
  const apiUrl = (() => {
    if (timePeriod === 'Custom Dates' && (!confirmedDateRange.from || !confirmedDateRange.to)) {
      return null // Don't fetch until dates are confirmed with Ok button
    }
    if (secondaryTimePeriod === 'Custom Dates' && (!secondaryConfirmedDateRange.from || !secondaryConfirmedDateRange.to)) {
      return null // Don't fetch until secondary dates are confirmed with Ok button
    }
    return buildApiUrl(timePeriod, confirmedDateRange, secondaryTimePeriod || 'Rolling 30 Days', secondaryConfirmedDateRange)
  })()

  const { data: rawData, error, mutate } = useSWR(apiUrl, fetcher, {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  // Build excluded IDs object for transformApiData
  const excludedIdsForTransform: ExcludedIdsByTable = {
    stl: getExcludedIdsForTable("stl"),
    connection: getExcludedIdsForTable("connection"),
    pitch: getExcludedIdsForTable("pitch"),
    conversion: getExcludedIdsForTable("conversion"),
    dialsPerHour: getExcludedIdsForTable("dialsPerHour"),
    grossIssue: getExcludedIdsForTable("grossIssue"),
    conversionQualified: getExcludedIdsForTable("conversionQualified"),
    conversionUnqualified: getExcludedIdsForTable("conversionUnqualified"),
  }

  const data = rawData ? transformApiData(rawData, selectedEmployees, dashboardType, confirmedTimeRange, excludedIdsForTransform) : null
  const secondaryData = rawData ? transformApiData(
    {
      settersCalls: rawData.secondarySettersCalls || [],
      confirmersCalls: rawData.secondaryConfirmersCalls || [],
      settersHours: rawData.secondarySettersHours || [],
      confirmersHours: rawData.secondaryConfirmersHours || [],
      IPPHours: rawData.secondaryIPPHours || [],
      settersScorecards: rawData.secondarySettersScorecards || [],
      confirmersScorecards: rawData.secondaryConfirmersScorecards || [],
      settersAppointments: rawData.secondarySettersAppointments || [],
      stl: [], // STL is team-wide, not needed for secondary metrics
    },
    selectedEmployees,
    dashboardType,
    secondaryConfirmedTimeRange,
    excludedIdsForTransform
  ) : null

  // Get unique employees from the appropriate calls array or hours array based on dashboard type
  const availableEmployees = rawData ? (() => {
    if (dashboardType === 'ipp') {
      // For IPP, get employees from IPPEmployees array or IPPHours
      const ippEmployees = rawData.IPPEmployees || []
      const ippHours = rawData.IPPHours || []
      const uniqueEmployees = new Set<string>()
      ippEmployees.forEach((emp: string) => uniqueEmployees.add(emp))
      ippHours.forEach((h: any) => {
        if (h.employee) {
          uniqueEmployees.add(h.employee)
        }
      })
      return Array.from(uniqueEmployees).sort()
    } else {
      const callsKey = dashboardType === 'setters' ? 'settersCalls' : 'confirmersCalls'
      const calls = rawData[callsKey] || []
      const uniqueEmployees = new Set<string>()
      calls.forEach((call: any) => {
        if (call.employee) {
          uniqueEmployees.add(call.employee)
        }
      })
      return Array.from(uniqueEmployees).sort()
    }
  })() : []

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
        secondaryConfirmedTimeRange
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

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
    setIsMenuOpen(false) // Close mobile menu if open
  }

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false)
    logout()
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
  const getFilteredCalls = (calls: any[]) => {
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
  }

  // Helper function to filter calls by secondary time range and employees (for performance metrics)
  const getFilteredSecondaryCalls = (calls: any[]) => {
    // Filter by time range if provided (only when using Custom Dates)
    let timeFilteredCalls = calls
    if (secondaryTimePeriod === 'Custom Dates' && secondaryConfirmedTimeRange && (secondaryConfirmedTimeRange.startHour !== undefined || secondaryConfirmedTimeRange.endHour !== undefined)) {
      timeFilteredCalls = calls.filter((call: any) => {
        if (!call.date) return false
        const hour = extractHourFromDateString(call.date)
        return isHourInTimeRange(hour, secondaryConfirmedTimeRange.startHour, secondaryConfirmedTimeRange.endHour)
      })
    }
    
    // Filter by employee if employees are selected
    let filteredCalls = timeFilteredCalls
    if (selectedEmployees.length > 0) {
      filteredCalls = timeFilteredCalls.filter((call: any) => selectedEmployees.includes(call.employee))
    }
    
    return filteredCalls
  }

  // Filter all calls for connection and dials per hour data tables
  const filteredAllCalls = rawData ? (() => {
    if (dashboardType !== 'setters') return []
    
    const callsKey = 'settersCalls'
    const allCalls = rawData[callsKey] || []
    return getFilteredCalls(allCalls)
  })() : []

  // Filter connected calls for pitch data table
  const filteredConnectedCalls = rawData ? (() => {
    if (dashboardType !== 'setters') return []
    
    const callsKey = 'settersCalls'
    const allCalls = rawData[callsKey] || []
    const filteredCalls = getFilteredCalls(allCalls)
    
    // Filter to only connected calls (connected === 1)
    const connectedCalls = filteredCalls.filter((call: any) => call.connected === 1)
    
    // Transform to PitchDataTable format
    return connectedCalls.map((call: any) => ({
      employee: call.employee || '',
      date: call.date || null,
      connected: call.connected || 0,
      pitched: call.pitched || 0,
      id: call.id ?? null,
    }))
  })() : []

  // Filter pitched calls for conversion data table
  const filteredPitchedCalls = rawData ? (() => {
    if (dashboardType !== 'setters') return []
    
    const callsKey = 'settersCalls'
    const allCalls = rawData[callsKey] || []
    const filteredCalls = getFilteredCalls(allCalls)
    
    // Filter to only pitched calls (pitched === 1)
    const pitchedCalls = filteredCalls.filter((call: any) => call.pitched === 1)
    
    // Transform to ConversionDataTable format
    return pitchedCalls.map((call: any) => ({
      employee: call.employee || '',
      date: call.date || null,
      pitched: call.pitched || 0,
      positive: call.positive || 0,
      qualified: call.qualified ?? null,
      id: call.id ?? null, // Use call.id as customer ID
    }))
  })() : []

  // Filter pitched calls for performance metrics tables (using secondary date range)
  const filteredSecondaryPitchedCalls = rawData ? (() => {
    if (dashboardType !== 'setters') return []
    
    const callsKey = 'secondarySettersCalls'
    const allCalls = rawData[callsKey] || []
    const filteredCalls = getFilteredSecondaryCalls(allCalls)
    
    // Filter to only pitched calls (pitched === 1)
    const pitchedCalls = filteredCalls.filter((call: any) => call.pitched === 1)
    
    // Transform to ConversionDataTable format
    return pitchedCalls.map((call: any) => ({
      employee: call.employee || '',
      date: call.date || null,
      pitched: call.pitched || 0,
      positive: call.positive || 0,
      qualified: call.qualified ?? null,
      id: call.id ?? null,
    }))
  })() : []

  // Filter appointments for gross issue data table using secondary date range
  const filteredSecondaryGrossIssueAppointments = rawData ? (() => {
    if (dashboardType !== 'setters') return []
    
    const appointmentsKey = 'secondarySettersAppointments'
    const allAppointments = rawData[appointmentsKey] || []

    // Filter appointments by selected employees
    let filteredAppointments = allAppointments
    if (selectedEmployees.length > 0) {
      filteredAppointments = allAppointments.filter((apt: any) => selectedEmployees.includes(apt.employee))
    }
    
    // Transform to GrossIssueDataTable format
    return filteredAppointments.map((apt: any) => ({
      employee: apt.employee || '',
      date: apt.date || null,
      ApptSet: apt.ApptSet ?? null,
      Issued: apt.Issued ?? null,
      NetIssued: apt.NetIssued ?? null,
      id: apt.id ?? null,
      lds_id: apt.lds_id ?? null,
      cst_id: apt.cst_id ?? null,
      dsp_id: apt.dsp_id ?? null,
    }))
  })() : []

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
    id: call.id ?? null,
  }))

  // Build available record IDs for filtering excluded records panel
  const availableRecordIdsForPanel = {
    stl: new Set<string>(filteredStlData.filter((r: any) => r.leadId != null).map((r: any) => String(r.leadId))),
    connection: new Set<string>(connectionTableData.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    pitch: new Set<string>(filteredConnectedCalls.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    conversion: new Set<string>(filteredPitchedCalls.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    dialsPerHour: new Set<string>(dialsPerHourTableData.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    conversionQualified: new Set<string>(filteredSecondaryPitchedCalls.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    conversionUnqualified: new Set<string>(filteredSecondaryPitchedCalls.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
    grossIssue: new Set<string>(filteredSecondaryGrossIssueAppointments.filter((r: any) => r.id != null).map((r: any) => String(r.id))),
  }

  // Count excluded records that are relevant to the current time range
  const relevantExcludedCount = excludedRecords.filter((record) => {
    const availableIds = availableRecordIdsForPanel[record.tableType as keyof typeof availableRecordIdsForPanel]
    if (!availableIds) return true
    return availableIds.has(record.recordId)
  }).length

  // Calculate total hours for dials per hour metric (same logic as in transformApiData)
  const totalHoursForDialsPerHour = rawData ? (() => {
    if (dashboardType !== 'setters') return 0
    
    const hoursKey = dashboardType === 'setters' ? 'settersHours' : dashboardType === 'confirmers' ? 'confirmersHours' : 'IPPHours'
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
  })() : 0

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

  return (
    <div className="min-h-screen bg-background">
      {/* Session Warning */}
      <SessionWarning />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold md:text-2xl">Call Center Dashboard</h1>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop: Show email */}
            <span className="hidden text-sm text-muted-foreground md:inline-block">{user?.email}</span>
            
            {/* Always visible: Theme & Refresh */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setExcludedRecordsPanelOpen(true)}
              className="relative"
            >
              <Ban className="h-4 w-4" />
              {relevantExcludedCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium"
                >
                  {relevantExcludedCount > 999 ? "999+" : relevantExcludedCount}
                </Badge>
              )}
            </Button>
            
            {/* Desktop: Show logout button */}
            <Button variant="outline" className="hidden md:flex" onClick={handleLogoutClick}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            
            {/* Mobile: Show hamburger menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <VisuallyHidden>
                    <SheetTitle>Account Menu</SheetTitle>
                  </VisuallyHidden>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Signed in as</span>
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                  <Button variant="destructive" onClick={handleLogoutClick} className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                Setters
              </Button>
              <Button
                variant={dashboardType === "confirmers" ? "default" : "outline"}
                onClick={() => setDashboardType("confirmers")}
                size="sm"
                className="min-w-[120px] dark:border-white/10"
              >
                Confirmers
              </Button>
              <Button
                variant={dashboardType === "ipp" ? "default" : "outline"}
                onClick={() => setDashboardType("ipp")}
                size="sm"
                className="min-w-[120px] dark:border-white/10"
              >
                IPP
              </Button>
            </div>
            <div className="flex gap-2 justify-evenly md:justify-start">
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

        {dashboardType === "ipp" ? (
          <>
            {/* IPP Dashboard - Only show employees for now */}
          </>
        ) : dashboardType === "setters" ? (
          <>
            {/* Featured Metrics */}
            {!data ? (
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
                  formula="((Dials - Connected) + ((Connected - Pitched) × 1.5) + ((Pitched - Positive) × 4) + (Positive × 10)) ÷ Total Hours"
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
            )}

            {/* Setters Metrics Gauges */}
            {!data ? (
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
                      <h2 className="text-2xl font-bold mb-2">Performance Metrics</h2>
                      <p className="text-sm text-muted-foreground">
                        These metrics are best viewed over longer time periods. Default: Rolling 30 Days
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center md:justify-end">
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
                {!secondaryData ? (
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
                      />
                      <CircularGauge
                        title="Conversion % (Qualified)"
                        value={secondaryData.settersMetrics.conversionQualified}
                        max={100}
                        target={85}
                        color={getGaugeColor(secondaryData.settersMetrics.conversionQualified, [64, 74, 84, 94])}
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
                        value={secondaryData.settersMetrics.conversionUnqualified}
                        max={100}
                        target={33}
                        color={getGaugeColor(secondaryData.settersMetrics.conversionUnqualified, [21, 26, 32, 39])}
                        unit="%"
                        size="small"
                        ranges={[
                          { label: "Bad", min: 0, max: 21, color: "#ef4444" },
                          { label: "Average", min: 22, max: 26, color: "#f97316" },
                          { label: "Good", min: 27, max: 32, color: "#eab308" },
                          { label: "Excellent", min: 33, max: 39, color: "#22c55e" },
                          { label: "Elite", min: 40, max: 100, color: "#3b82f6" },
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
        ) : (
          <>
            {/* Confirmers Metrics Gauges */}
            {!data ? (
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
              />
            </div>
            )}
          </>
        )}

        {/* Employee Indicators */}
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Team Members</h2>
          {employees.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Users className="h-12 w-12 mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Team Members</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No team member data available for the selected period
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
                  ippMode={dashboardType === 'ipp'}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Loading Overlay - Only show on initial load, not when waiting for custom date selection */}
      {!data && !(timePeriod === 'Custom Dates' && (!confirmedDateRange.from || !confirmedDateRange.to)) && !(secondaryTimePeriod === 'Custom Dates' && (!secondaryConfirmedDateRange.from || !secondaryConfirmedDateRange.to)) && <LoadingScreen />}

      {/* STL Data Table Dialog */}
      {rawData && rawData.stl && (
        <>
          <STLDataTable
            data={filteredStlData}
            open={stlTableOpen}
            onOpenChange={setStlTableOpen}
            excludedIds={getExcludedIdsForTable("stl")}
            onExcludeRecords={(ids) => excludeRecords("stl", ids)}
          />
        </>
      )}

      {/* Conversion Data Table Dialog */}
      {dashboardType === 'setters' && (
        <>
          <ConversionDataTable
            data={filteredPitchedCalls}
            open={conversionTableOpen}
            onOpenChange={setConversionTableOpen}
            excludedIds={getExcludedIdsForTable("conversion")}
            onExcludeRecords={(ids) => excludeRecords("conversion", ids)}
          />
          <PitchDataTable
            data={filteredConnectedCalls}
            open={pitchTableOpen}
            onOpenChange={setPitchTableOpen}
            excludedIds={getExcludedIdsForTable("pitch")}
            onExcludeRecords={(ids) => excludeRecords("pitch", ids)}
          />
          <ConnectionDataTable
            data={connectionTableData}
            open={connectionTableOpen}
            onOpenChange={setConnectionTableOpen}
            excludedIds={getExcludedIdsForTable("connection")}
            onExcludeRecords={(ids) => excludeRecords("connection", ids)}
          />
          <DialsPerHourDataTable
            data={dialsPerHourTableData}
            totalHours={totalHoursForDialsPerHour}
            open={dialsPerHourTableOpen}
            onOpenChange={setDialsPerHourTableOpen}
            excludedIds={getExcludedIdsForTable("dialsPerHour")}
            onExcludeRecords={(ids) => excludeRecords("dialsPerHour", ids)}
          />
          <ConversionQualifiedDataTable
            data={filteredSecondaryPitchedCalls}
            open={conversionQualifiedTableOpen}
            onOpenChange={setConversionQualifiedTableOpen}
            excludedIds={getExcludedIdsForTable("conversionQualified")}
            onExcludeRecords={(ids) => excludeRecords("conversionQualified", ids)}
          />
          <ConversionUnqualifiedDataTable
            data={filteredSecondaryPitchedCalls}
            open={conversionUnqualifiedTableOpen}
            onOpenChange={setConversionUnqualifiedTableOpen}
            excludedIds={getExcludedIdsForTable("conversionUnqualified")}
            onExcludeRecords={(ids) => excludeRecords("conversionUnqualified", ids)}
          />
          <GrossIssueDataTable
            data={filteredSecondaryGrossIssueAppointments}
            open={grossIssueTableOpen}
            onOpenChange={setGrossIssueTableOpen}
            excludedIds={getExcludedIdsForTable("grossIssue")}
            onExcludeRecords={(ids) => excludeRecords("grossIssue", ids)}
            timePeriod={secondaryTimePeriod}
            dateRange={secondaryConfirmedDateRange}
            timeRange={secondaryConfirmedTimeRange}
          />
        </>
      )}

      {/* Excluded Records Panel */}
      <ExcludedRecordsPanel
        open={excludedRecordsPanelOpen}
        onOpenChange={setExcludedRecordsPanelOpen}
        excludedRecords={excludedRecords}
        onRestoreRecords={restoreByDocIds}
        loading={excludedRecordsLoading}
        availableRecordIds={availableRecordIdsForPanel}
      />
    </div>
  )
}
