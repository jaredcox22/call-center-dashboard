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

const fetcher = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    employees: [
      { id: "1", name: "John Doe", status: "active", dials: 45, connections: 12, conversions: 3 },
      { id: "2", name: "Jane Smith", status: "active", dials: 38, connections: 10, conversions: 2 },
      { id: "3", name: "Mike Johnson", status: "break", dials: 52, connections: 15, conversions: 4 },
      { id: "4", name: "Sarah Williams", status: "active", dials: 41, connections: 11, conversions: 3 },
    ],
    settersMetrics: {
      dialsPerHour: Math.floor(Math.random() * 30) + 40,
      connectionRate: Math.floor(Math.random() * 20) + 25,
      pitchRate: Math.floor(Math.random() * 25) + 30,
      conversionRate: Math.floor(Math.random() * 15) + 15,
      horsepower: Math.floor(Math.random() * 200) + 300,
      skillScore: Math.floor(Math.random() * 30) + 60,
      gradeCard: Math.floor(Math.random() * 20) + 70,
      conversionQualified: Math.floor(Math.random() * 20) + 20,
      conversionUnqualified: Math.floor(Math.random() * 15) + 10,
      grossIssue: Math.floor(Math.random() * 25) + 35,
      checkoutToDialTime: Math.floor(Math.random() * 90) + 30,
    },
    confirmersMetrics: {
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
  const [timePeriod, setTimePeriod] = useState("today")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [dashboardType, setDashboardType] = useState<"setters" | "confirmers">("setters")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const { data, error, mutate } = useSWR("dashboard-data", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  })

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
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-9 w-[140px] dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
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
                color={getGaugeColor(settersMetrics.horsepower, [200, 300, 400, 500])}
                subtitle="Combined Performance Score"
              />
              <FeaturedMetricCard
                title="Skill Score"
                value={settersMetrics.skillScore}
                unit="pts"
                color={getGaugeColor(settersMetrics.skillScore, [50, 65, 75, 85])}
                subtitle="Overall Skill Rating"
              />
              <FeaturedMetricCard
                title="Checkout to Dial Time"
                value={settersMetrics.checkoutToDialTime}
                unit="s"
                color={getGaugeColor(settersMetrics.checkoutToDialTime, [90, 60, 45, 30])}
                subtitle="Speed Metric"
              />
            </div>

            {/* Setters Metrics Gauges */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
              <CircularGauge
                title="Dials Per Hour"
                value={settersMetrics.dialsPerHour}
                max={100}
                color={getGaugeColor(settersMetrics.dialsPerHour, [30, 40, 50, 60])}
                unit="dials"
                size="small"
              />
              <CircularGauge
                title="Connection %"
                value={settersMetrics.connectionRate}
                max={100}
                color={getGaugeColor(settersMetrics.connectionRate, [20, 30, 40, 50])}
                unit="%"
                size="small"
              />
              <CircularGauge
                title="Pitch %"
                value={settersMetrics.pitchRate}
                max={100}
                color={getGaugeColor(settersMetrics.pitchRate, [25, 35, 45, 55])}
                unit="%"
                size="small"
              />
              <CircularGauge
                title="Conversion %"
                value={settersMetrics.conversionRate}
                max={100}
                color={getGaugeColor(settersMetrics.conversionRate, [10, 20, 30, 40])}
                unit="%"
                size="small"
              />
              <CircularGauge
                title="Grade Card"
                value={settersMetrics.gradeCard}
                max={100}
                color={getGaugeColor(settersMetrics.gradeCard, [60, 70, 80, 90])}
                unit="%"
                size="small"
              />
              <CircularGauge
                title="Conversion % (Qualified)"
                value={settersMetrics.conversionQualified}
                max={100}
                color={getGaugeColor(settersMetrics.conversionQualified, [15, 25, 35, 45])}
                unit="%"
                size="small"
              />
              <CircularGauge
                title="Conversion % (Un-Qualified)"
                value={settersMetrics.conversionUnqualified}
                max={100}
                color={getGaugeColor(settersMetrics.conversionUnqualified, [5, 15, 25, 35])}
                unit="%"
                size="small"
              />
              <CircularGauge
                title="Gross Issue"
                value={settersMetrics.grossIssue}
                max={100}
                color={getGaugeColor(settersMetrics.grossIssue, [25, 35, 45, 55])}
                unit="%"
                size="small"
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
                status={employee.status as "active" | "break" | "offline"}
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
