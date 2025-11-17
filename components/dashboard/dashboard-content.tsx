"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CircularGauge } from "./circular-gauge"
import { EmployeeIndicator } from "./employee-indicator"
import { FeaturedMetricCard } from "./featured-metric-card"
import { STLDataTable } from "./stl-data-table"
import { LogOut, RefreshCw, Moon, Sun, Menu, CalendarIcon, AlertCircle, Users } from "lucide-react"
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
 * Formats seconds into a human-readable minutes and seconds format
 * Examples: 45 -> "45s", 90 -> "1m 30s", 125 -> "2m 5s"
 */
const formatSecondsToMinutes = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
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

const transformApiData = (apiData: any, selectedEmployee: string, dashboardType: 'setters' | 'confirmers') => {
  // Use the appropriate calls array based on dashboard type
  const callsKey = dashboardType === 'setters' ? 'settersCalls' : 'confirmersCalls'
  const allCalls = apiData[callsKey] || []
  
  // Get scorecards based on dashboard type
  const scorecardsKey = dashboardType === 'setters' ? 'settersScorecards' : 'confirmersScorecards'
  const allScorecards = apiData[scorecardsKey] || []
  
  // Keep team-wide STL data (checkout to dial time is a TEAM metric)
  const teamStl = apiData.stl || []
  
  // Filter data by employee if not "all"
  let filteredCalls = allCalls
  let filteredHours = apiData.hours || []
  let filteredScorecards = allScorecards
  
  if (selectedEmployee !== 'all') {
    filteredCalls = allCalls.filter((call: any) => call.employee === selectedEmployee)
    filteredHours = apiData.hours?.filter((h: any) => h.employee === selectedEmployee) || []
    filteredScorecards = allScorecards.filter((scorecard: any) => scorecard.employee === selectedEmployee)
  }
  
  // Calculate metrics from raw call data
  const employees = new Map()
  const callsByEmployee = new Map()
  
  // Aggregate calls by employee
  filteredCalls.forEach((call: any) => {
    if (!callsByEmployee.has(call.employee)) {
      callsByEmployee.set(call.employee, [])
    }
    callsByEmployee.get(call.employee).push(call)
  })
  
  // Create a map of hours by employee name
  const hoursByEmployee = new Map<string, number>()
  filteredHours.forEach((h: any) => {
    if (h.employee) {
      hoursByEmployee.set(h.employee, h.hours || 0)
    }
  })

  // Calculate per-employee stats
  callsByEmployee.forEach((calls, employeeName) => {
    const dials = calls.length
    const connected = calls.filter((c: any) => c.connected === 1).length
    const pitched = calls.filter((c: any) => c.pitched === 1).length
    const positive = calls.filter((c: any) => c.positive === 1).length
    const hours = hoursByEmployee.get(employeeName) || 0
    
    // Calculate horsepower per employee using the same formula as team metric
    const horsepower = dials > 0 && hours > 0
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
  
  // Calculate overall metrics
  const totalCalls = filteredCalls.length
  const totalConnected = filteredCalls.filter((c: any) => c.connected === 1).length
  const totalPitched = filteredCalls.filter((c: any) => c.pitched === 1).length
  const totalPositive = filteredCalls.filter((c: any) => c.positive === 1).length
  const totalQualified = filteredCalls.filter((c: any) => c.qualified === true).length
  const totalUnqualified = filteredCalls.filter((c: any) => c.qualified === false && c.positive === 1).length
  
  // Calculate total hours
  const totalHours = filteredHours.reduce((sum: number, h: any) => sum + h.hours, 0)
  
  // Calculate average STL (checkout to dial time) in seconds - TEAM metric only
  // Only include STL values greater than 0 in the average
  const validStl = teamStl.filter((s: any) => s.stl > 0)
  const avgStl = validStl.length > 0 
    ? validStl.reduce((sum: number, s: any) => sum + s.stl, 0) / validStl.length
    : 0
  
  // Calculate metrics - return 0 if no data
  const dialsPerHour = totalCalls > 0 && totalHours > 0 ? Math.round(totalCalls / totalHours) : 0
  const connectionRate = totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 100) : 0
  const pitchRate = totalConnected > 0 ? Math.round((totalPitched / totalConnected) * 100) : 0
  const conversionRate = totalPitched > 0 ? Math.round((totalPositive / totalPitched) * 100) : 0
  const conversionQualified = totalPitched > 0 ? Math.round((totalQualified / totalPitched) * 100) : 0
  const conversionUnqualified = totalPitched > 0 ? Math.round((totalUnqualified / totalPitched) * 100) : 0
  const grossIssue = totalCalls > 0 ? Math.round((totalPositive / totalCalls) * 100) : 0
  
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
      // Return 0 if no confirmers data (calls or scorecards)
      // Only show metrics when on confirmers dashboard AND there's actual data
      contactRate: hasConfirmersData ? Math.floor(Math.random() * 25) + 40 : 0,
      grossIssueRate: hasConfirmersData ? Math.floor(Math.random() * 20) + 30 : 0,
      netIssueRate: hasConfirmersData ? Math.floor(Math.random() * 20) + 25 : 0,
      oneLegsRate: hasConfirmersData ? Math.floor(Math.random() * 15) + 15 : 0,
      scorecard: (dashboardType === 'confirmers') ? scoreCard : 0, // Use scorecard calculation for confirmers only
    },
  }
}

export function DashboardContent() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [timePeriod, setTimePeriod] = useState("Today")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [dashboardType, setDashboardType] = useState<"setters" | "confirmers">("setters")
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

  // Track user activity for session management
  useActivityTracker()

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

  const data = rawData ? transformApiData(rawData, selectedEmployee, dashboardType) : null
  const secondaryData = rawData ? transformApiData(
    {
      settersCalls: rawData.secondarySettersCalls || [],
      confirmersCalls: rawData.secondaryConfirmersCalls || [],
      hours: rawData.secondaryHours || [],
      settersScorecards: rawData.secondarySettersScorecards || [],
      confirmersScorecards: rawData.secondaryConfirmersScorecards || [],
      stl: [], // STL is team-wide, not needed for secondary metrics
    },
    selectedEmployee,
    dashboardType
  ) : null
  console.log(data);
  // Get unique employees from the appropriate calls array based on dashboard type
  const availableEmployees = rawData ? (() => {
    const callsKey = dashboardType === 'setters' ? 'settersCalls' : 'confirmersCalls'
    const calls = rawData[callsKey] || []
    const uniqueEmployees = new Set<string>()
    calls.forEach((call: any) => {
      if (call.employee) {
        uniqueEmployees.add(call.employee)
      }
    })
    return Array.from(uniqueEmployees).sort()
  })() : []

  // Auto-reset employee filter if selected employee doesn't exist in current data
  useEffect(() => {
    if (selectedEmployee !== 'all' && availableEmployees.length > 0) {
      const employeeExists = availableEmployees.includes(selectedEmployee)
      if (!employeeExists) {
        setSelectedEmployee('all')
      }
    }
  }, [rawData, selectedEmployee, dashboardType, availableEmployees])

  // Clear custom dates when switching away from "Custom Dates" option
  useEffect(() => {
    if (timePeriod !== 'Custom Dates') {
      setCustomDateRange({ from: undefined, to: undefined })
      setConfirmedDateRange({ from: undefined, to: undefined })
    }
  }, [timePeriod])

  // Clear secondary custom dates when switching away from "Custom Dates" option
  useEffect(() => {
    if (secondaryTimePeriod !== 'Custom Dates') {
      setSecondaryCustomDateRange({ from: undefined, to: undefined })
      setSecondaryConfirmedDateRange({ from: undefined, to: undefined })
    }
  }, [secondaryTimePeriod])

  const handleDateRangeOk = () => {
    if (customDateRange.from && customDateRange.to) {
      setConfirmedDateRange(customDateRange)
      setDatePickerOpen(false)
      setMobilePickerOpen(false)
    }
  }

  const handleDateRangeReset = () => {
    setCustomDateRange({ from: undefined, to: undefined })
    setConfirmedDateRange({ from: undefined, to: undefined })
  }

  const handleSecondaryDateRangeOk = () => {
    if (secondaryCustomDateRange.from && secondaryCustomDateRange.to) {
      setSecondaryConfirmedDateRange(secondaryCustomDateRange)
      setSecondaryDatePickerOpen(false)
      setSecondaryMobilePickerOpen(false)
    }
  }

  const handleSecondaryDateRangeReset = () => {
    setSecondaryCustomDateRange({ from: undefined, to: undefined })
    setSecondaryConfirmedDateRange({ from: undefined, to: undefined })
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
                      {confirmedDateRange.from && confirmedDateRange.to
                        ? `${format(confirmedDateRange.from, "MMM d, yyyy")} - ${format(confirmedDateRange.to, "MMM d, yyyy")}`
                        : "Pick dates"}
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
                    <div className="flex items-center justify-end gap-2 p-3 border-t">
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
                        disabled={!customDateRange.from || !customDateRange.to}
                      >
                        Ok
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-9 dark:border-white/10 bg-white dark:bg-transparent w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {availableEmployees.map((employeeName: string) => (
                    <SelectItem key={employeeName} value={employeeName}>
                      {employeeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {timePeriod === "Custom Dates" && (
                <Popover open={mobilePickerOpen} onOpenChange={setMobilePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex md:hidden h-9 dark:border-white/10 bg-white dark:bg-transparent font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {confirmedDateRange.from && confirmedDateRange.to
                        ? `${format(confirmedDateRange.from, "MMM d, yyyy")} - ${format(confirmedDateRange.to, "MMM d, yyyy")}`
                        : "Pick dates"}
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
                    <div className="flex items-center justify-end gap-2 p-3 border-t">
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
                        disabled={!customDateRange.from || !customDateRange.to}
                      >
                        Ok
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
          </div>
        </Card>

        {dashboardType === "setters" ? (
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
                  color={getGaugeColor(settersMetrics.horsepower, [40, 51, 67, 90])}
                  subtitle="Combined Performance Score"
                  target={67}
                  ranges={[
                    { label: "Bad", min: 0, max: 39, color: "#ef4444" },
                    { label: "Average", min: 40, max: 50, color: "#f97316" },
                    { label: "Good", min: 51, max: 66, color: "#eab308" },
                    { label: "Excellent", min: 67, max: 89, color: "#22c55e" },
                    { label: "Elite", min: 90, max: 100, color: "#3b82f6" },
                  ]}
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
                              {secondaryConfirmedDateRange.from && secondaryConfirmedDateRange.to
                                ? `${format(secondaryConfirmedDateRange.from, "MMM d, yyyy")} - ${format(secondaryConfirmedDateRange.to, "MMM d, yyyy")}`
                                : "Pick dates"}
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
                            <div className="flex items-center justify-end gap-2 p-3 border-t">
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
                                disabled={!secondaryCustomDateRange.from || !secondaryCustomDateRange.to}
                              >
                                Ok
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      {secondaryTimePeriod === "Custom Dates" && (
                        <Popover open={secondaryMobilePickerOpen} onOpenChange={setSecondaryMobilePickerOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="flex md:hidden h-9 dark:border-white/10 bg-white dark:bg-transparent font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {secondaryConfirmedDateRange.from && secondaryConfirmedDateRange.to
                                ? `${format(secondaryConfirmedDateRange.from, "MMM d, yyyy")} - ${format(secondaryConfirmedDateRange.to, "MMM d, yyyy")}`
                                : "Pick dates"}
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
                            <div className="flex items-center justify-end gap-2 p-3 border-t">
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
                                disabled={!secondaryCustomDateRange.from || !secondaryCustomDateRange.to}
                              >
                                Ok
                              </Button>
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
                      />
                    </div>
                    {/* Other Metrics Grid */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <CircularGauge
                        title="ScoreCard"
                        value={secondaryData.settersMetrics.scoreCard}
                        max={100}
                        target={90}
                        color={getGaugeColor(secondaryData.settersMetrics.scoreCard, [69, 79, 89, 99])}
                        unit="%"
                        size="small"
                        ranges={[
                          { label: "Bad", min: 0, max: 69, color: "#ef4444" },
                          { label: "Average", min: 70, max: 79, color: "#f97316" },
                          { label: "Good", min: 80, max: 89, color: "#eab308" },
                          { label: "Excellent", min: 90, max: 99, color: "#22c55e" },
                          { label: "Elite", min: 100, max: 100, color: "#3b82f6" },
                        ]}
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
        <STLDataTable
          data={rawData.stl}
          open={stlTableOpen}
          onOpenChange={setStlTableOpen}
        />
      )}
    </div>
  )
}
