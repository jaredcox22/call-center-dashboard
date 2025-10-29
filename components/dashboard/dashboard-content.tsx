"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CircularGauge } from "./circular-gauge"
import { EmployeeIndicator } from "./employee-indicator"
import { FeaturedMetricCard } from "./featured-metric-card"
import { LogOut, RefreshCw, Moon, Sun, Menu } from "lucide-react"
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
import useSWR from "swr"

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // For CORS with credentials
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  
  return response.json()
}

const buildApiUrl = (dateRange: string) => {
  const baseUrl = 'https://api.integrityprodserver.com/dashboards/ccHorsepower.php'
  const params = new URLSearchParams({ dateRange })
  return `${baseUrl}?${params.toString()}`
}

const transformApiData = (apiData: any, selectedEmployee: string) => {
  // Filter data by employee if not "all"
  let filteredCalls = apiData.calls
  let filteredHours = apiData.hours
  let filteredStl = apiData.stl || []
  
  if (selectedEmployee !== 'all') {
    filteredCalls = apiData.calls.filter((call: any) => call.employee === selectedEmployee)
    filteredHours = apiData.hours.filter((h: any) => h.employee === selectedEmployee)
    filteredStl = filteredStl.filter((s: any) => s.employee === selectedEmployee)
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
  
  // Calculate per-employee stats
  callsByEmployee.forEach((calls, employeeName) => {
    const connected = calls.filter((c: any) => c.connected === 1).length
    const pitched = calls.filter((c: any) => c.pitched === 1).length
    const positive = calls.filter((c: any) => c.positive === 1).length
    
    employees.set(employeeName, {
      dials: calls.length,
      connections: connected,
      conversions: positive,
      pitches: pitched,
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
  const totalHours = filteredHours.reduce((sum: number, h: any) => sum + h.hours, 0) || 1
  
  // Calculate average STL (checkout to dial time) in seconds
  const avgStl = filteredStl.length > 0 
    ? filteredStl.reduce((sum: number, s: any) => sum + s.stl, 0) / filteredStl.length
    : 60
  
  // Calculate metrics
  const dialsPerHour = Math.round(totalCalls / totalHours)
  const connectionRate = totalCalls > 0 ? Math.round((totalConnected / totalCalls) * 100) : 0
  const pitchRate = totalConnected > 0 ? Math.round((totalPitched / totalConnected) * 100) : 0
  const conversionRate = totalPitched > 0 ? Math.round((totalPositive / totalPitched) * 100) : 0
  const conversionQualified = totalPitched > 0 ? Math.round((totalQualified / totalPitched) * 100) : 0
  const conversionUnqualified = totalPitched > 0 ? Math.round((totalUnqualified / totalPitched) * 100) : 0
  const grossIssue = totalCalls > 0 ? Math.round((totalPositive / totalCalls) * 100) : 0
  
  // Calculate horsepower (composite score)
  const horsepower = Math.round(
    (dialsPerHour * 2) + (connectionRate * 3) + (conversionRate * 5)
  )
  
  // Calculate skill score
  const skillScore = Math.round(
    (pitchRate * 0.4) + (conversionRate * 0.6)
  )
  
  // Calculate score card (overall performance)
  const scoreCard = Math.round(
    (connectionRate * 0.3) + (pitchRate * 0.3) + (conversionRate * 0.4)
  )
  
  return {
    employees: Array.from(employees.entries()).map(([name, stats], index) => ({
      id: String(index + 1),
      name,
      dials: (stats as any).dials,
      connections: (stats as any).connections,
      conversions: (stats as any).conversions,
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
      // Keep mock data for now or calculate from different API endpoint
      contactRate: Math.floor(Math.random() * 25) + 40,
      grossIssueRate: Math.floor(Math.random() * 20) + 30,
      netIssueRate: Math.floor(Math.random() * 20) + 25,
      oneLegsRate: Math.floor(Math.random() * 15) + 15,
      scorecard: Math.floor(Math.random() * 25) + 65,
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

  const apiUrl = buildApiUrl(timePeriod)

  const { data: rawData, error, mutate } = useSWR(apiUrl, fetcher, {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  })

  const data = rawData ? transformApiData(rawData, selectedEmployee) : null

  const getGaugeColor = (value: number, thresholds: number[]) => {
    if (value < thresholds[0]) return "#ef4444" // red
    if (value < thresholds[1]) return "#f97316" // orange
    if (value < thresholds[2]) return "#eab308" // gold
    if (value < thresholds[3]) return "#22c55e" // green
    return "#3b82f6" // blue
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

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const { employees, settersMetrics, confirmersMetrics } = data

  return (
    <div className="min-h-screen bg-background">
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
                <SelectTrigger className="h-9 w-[140px] dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="Rolling 7 Days">Rolling 7 Days</SelectItem>
                  <SelectItem value="This Week (Sun-Sat)">This Week</SelectItem>
                  <SelectItem value="Last Week (Sun-Sat)">Last Week</SelectItem>
                  <SelectItem value="Rolling 30 Days">Rolling 30 Days</SelectItem>
                  <SelectItem value="This Month to Date">This Month to Date</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="Year to Date">Year to Date</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-9 w-[140px] dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {rawData?.hours?.map((emp: any) => (
                    <SelectItem key={emp.employee} value={emp.employee}>
                      {emp.employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {dashboardType === "setters" ? (
          <>
            {/* Featured Metrics */}
            <div className="mb-4 grid gap-6 grid-cols-1 sm:grid-cols-3">
              <FeaturedMetricCard
                title="Horsepower"
                value={settersMetrics.horsepower}
                unit="HP"
                color={getGaugeColor(settersMetrics.horsepower, [29.5, 39.4, 50.3, 65.6])}
                subtitle="Combined Performance Score"
                ranges={[
                  { label: "Bad", min: 0, max: 29, color: "#ef4444" },
                  { label: "Average", min: 30, max: 39, color: "#f97316" },
                  { label: "Good", min: 40, max: 50, color: "#eab308" },
                  { label: "Excellent", min: 51, max: 65, color: "#22c55e" },
                  { label: "Elite", min: 66, color: "#3b82f6" },
                ]}
              />
              <FeaturedMetricCard
                title="Skill Score"
                value={settersMetrics.skillScore}
                unit="pts"
                color={getGaugeColor(settersMetrics.skillScore, [29.5, 39.4, 50.3, 65.6])}
                subtitle="Overall Skill Rating"
                ranges={[
                  { label: "Bad", min: 0, max: 29, color: "#ef4444" },
                  { label: "Average", min: 30, max: 39, color: "#f97316" },
                  { label: "Good", min: 40, max: 50, color: "#eab308" },
                  { label: "Excellent", min: 51, max: 65, color: "#22c55e" },
                  { label: "Elite", min: 66, color: "#3b82f6" },
                ]}
              />
              <FeaturedMetricCard
                title="Checkout to Dial Time"
                value={settersMetrics.checkoutToDialTime}
                unit="s"
                color={getGaugeColor(settersMetrics.checkoutToDialTime, [90, 60, 45, 30])}
                subtitle="Speed Metric"
                ranges={[
                  { label: "Elite", min: 0, max: 29, color: "#3b82f6" },
                  { label: "Excellent", min: 30, max: 44, color: "#22c55e" },
                  { label: "Good", min: 45, max: 59, color: "#eab308" },
                  { label: "Average", min: 60, max: 89, color: "#f97316" },
                  { label: "Bad", min: 90, color: "#ef4444" },
                ]}
              />
            </div>

            {/* Setters Metrics Gauges */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
              <CircularGauge
                title="Dials Per Hour"
                value={settersMetrics.dialsPerHour}
                max={100}
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
                color={getGaugeColor(settersMetrics.pitchRate, [90, 95, 97, 99])}
                unit="%"
                size="small"
                ranges={[
                  { label: "Bad", min: 0, max: 89, color: "#ef4444" },
                  { label: "Average", min: 90, max: 94, color: "#f97316" },
                  { label: "Good", min: 95, max: 96, color: "#eab308" },
                  { label: "Excellent", min: 97, max: 98, color: "#22c55e" },
                  { label: "Elite", min: 99, color: "#3b82f6" },
                ]}
              />
              <CircularGauge
                title="Conversion %"
                value={settersMetrics.conversionRate}
                max={100}
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
              <CircularGauge
                title="ScoreCard"
                value={settersMetrics.scoreCard}
                max={100}
                color={getGaugeColor(settersMetrics.scoreCard, [22, 25, 29, 34])}
                unit="%"
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
                title="Conversion % (Qualified)"
                value={settersMetrics.conversionQualified}
                max={100}
                color={getGaugeColor(settersMetrics.conversionQualified, [22, 27, 33, 40])}
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
              <CircularGauge
                title="Conversion % (Un-Qualified)"
                value={settersMetrics.conversionUnqualified}
                max={100}
                color={getGaugeColor(settersMetrics.conversionUnqualified, [22, 27, 33, 40])}
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
              <CircularGauge
                title="Gross Issue"
                value={settersMetrics.grossIssue}
                max={100}
                color={getGaugeColor(settersMetrics.grossIssue, [22, 27, 33, 40])}
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
          </>
        ) : (
          <>
            {/* Confirmers Metrics Gauges */}
            <div className="mb-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
              <CircularGauge
                title="Contact Rate"
                value={confirmersMetrics.contactRate}
                max={100}
                color={getGaugeColor(confirmersMetrics.contactRate, [30, 45, 60, 75])}
                unit="%"
              />
              <CircularGauge
                title="Gross Issue Rate"
                value={confirmersMetrics.grossIssueRate}
                max={100}
                color={getGaugeColor(confirmersMetrics.grossIssueRate, [20, 35, 50, 65])}
                unit="%"
              />
              <CircularGauge
                title="Net Issue Rate"
                value={confirmersMetrics.netIssueRate}
                max={100}
                color={getGaugeColor(confirmersMetrics.netIssueRate, [15, 30, 45, 60])}
                unit="%"
              />
              <CircularGauge
                title="1-Leg Rate"
                value={confirmersMetrics.oneLegsRate}
                max={100}
                color={getGaugeColor(confirmersMetrics.oneLegsRate, [10, 20, 30, 40])}
                unit="%"
              />
              <CircularGauge
                title="Scorecard"
                value={confirmersMetrics.scorecard}
                max={100}
                color={getGaugeColor(confirmersMetrics.scorecard, [55, 70, 80, 90])}
                unit="pts"
              />
            </div>
          </>
        )}

        {/* Employee Indicators */}
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Team Members</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {employees.map((employee) => (
              <EmployeeIndicator
                key={employee.id}
                name={employee.name}
                dials={employee.dials}
                connections={employee.connections}
                conversions={employee.conversions}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
