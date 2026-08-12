"use client"

import { useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Info, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Calendar, Clock, User, Package, Radio, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  SelectionCheckbox,
  SelectAllCheckbox,
  ExcludeRowButton,
  ExcludeSelectedButton,
} from "./table-row-selection"

/**
 * Formats a date string to a readable format
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy h:mm a")
  } catch {
    return dateString
  }
}

/**
 * Formats hour to 12-hour format
 */
const formatHourTo12Hour = (hour: number): string => {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

const EMPTY_FILTER_VALUE = "(None)"

/**
 * Formats multi-select filter selection text for display
 */
const formatSelectionText = (selected: string[], allLabel: string): string => {
  if (selected.length === 0) {
    return allLabel
  }
  if (selected.length === 1) {
    return selected[0]
  }
  if (selected.length === 2) {
    return `${selected[0]}, ${selected[1]}`
  }
  return `${selected.length} selected`
}

const toFilterValue = (value: string | number | null | undefined): string => {
  if (value == null || String(value).trim() === "") {
    return EMPTY_FILTER_VALUE
  }
  return String(value)
}

interface MultiSelectFilterProps {
  label: string
  allLabel: string
  options: string[]
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: ReactNode
  widthClassName?: string
}

function MultiSelectFilter({
  label,
  allLabel,
  options,
  selected,
  onSelectedChange,
  open,
  onOpenChange,
  icon,
  widthClassName = "w-full sm:w-[180px]",
}: MultiSelectFilterProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`${widthClassName} justify-between font-normal`}>
          {icon}
          <span className="truncate text-left flex-1">{formatSelectionText(selected, allLabel)}</span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="end">
        <div className="p-2 max-h-[300px] overflow-auto">
          <div className="px-2 py-1 text-xs text-muted-foreground font-medium">{label}</div>
          <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
            <Checkbox
              checked={selected.length === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectedChange([])
                }
              }}
            />
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              onClick={() => onSelectedChange([])}
            >
              {allLabel}
            </label>
          </div>
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectedChange([...selected, option])
                  } else {
                    onSelectedChange(selected.filter((item) => item !== option))
                  }
                }}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                onClick={() => {
                  if (selected.includes(option)) {
                    onSelectedChange(selected.filter((item) => item !== option))
                  } else {
                    onSelectedChange([...selected, option])
                  }
                }}
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface GrossIssueRecord {
  employee: string
  date: string | null
  ApptSet: number | null
  Issued: number | null
  NetIssued: number | null
  id?: number | null
  lds_id?: number | null
  cst_id?: number | null
  dsp_id?: number | null
  Productid?: string | number | null
  SourceCode?: string | null
  Descr?: string | null
}

interface TimeRange {
  startHour: number | undefined
  endHour: number | undefined
}

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

interface GrossIssueDataTableProps {
  data: GrossIssueRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedIds?: Set<string>
  onExcludeRecords?: (recordIds: string[]) => void
  timePeriod?: string
  dateRange?: DateRange
  timeRange?: TimeRange
  selectedEmployees?: string[] // Sync with main dashboard employee filter
}

type SortField = "employee" | "date" | "ApptSet" | "Issued" | "NetIssued" | "lds_id" | "cst_id" | "dsp_id" | "Productid" | "SourceCode" | "Descr"
type SortDirection = "asc" | "desc" | null

export function GrossIssueDataTable({ 
  data, 
  open, 
  onOpenChange,
  excludedIds = new Set(),
  onExcludeRecords,
  timePeriod,
  dateRange,
  timeRange,
  selectedEmployees: propSelectedEmployees = [],
}: GrossIssueDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(propSelectedEmployees)
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [productSelectOpen, setProductSelectOpen] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false)
  const [selectedSubSources, setSelectedSubSources] = useState<string[]>([])
  const [subSourceSelectOpen, setSubSourceSelectOpen] = useState(false)
  const itemsPerPage = 50 // Render only 50 rows at a time to prevent blocking

  // Get unique employees from data for the filter
  const uniqueEmployees = useMemo(() => {
    const employees = new Set<string>()
    data.forEach((record) => {
      if (record.employee) {
        employees.add(record.employee)
      }
    })
    return Array.from(employees).sort((a, b) => a.localeCompare(b))
  }, [data])

  const uniqueProducts = useMemo(() => {
    const products = new Set<string>()
    data.forEach((record) => {
      products.add(toFilterValue(record.Productid))
    })
    return Array.from(products).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [data])

  const uniqueSources = useMemo(() => {
    const sources = new Set<string>()
    data.forEach((record) => {
      sources.add(toFilterValue(record.SourceCode))
    })
    return Array.from(sources).sort((a, b) => a.localeCompare(b))
  }, [data])

  const uniqueSubSources = useMemo(() => {
    const subSources = new Set<string>()
    data.forEach((record) => {
      const source = toFilterValue(record.SourceCode)
      if (selectedSources.length === 0 || selectedSources.includes(source)) {
        subSources.add(toFilterValue(record.Descr))
      }
    })
    return Array.from(subSources).sort((a, b) => a.localeCompare(b))
  }, [data, selectedSources])

  // Drop sub-source selections that are no longer available for the selected source(s)
  useEffect(() => {
    setSelectedSubSources((prev) => {
      if (prev.length === 0) return prev
      const next = prev.filter((subSource) => uniqueSubSources.includes(subSource))
      return next.length === prev.length ? prev : next
    })
  }, [uniqueSubSources])

  // Track previous open state to detect when dialog transitions from closed to open
  const prevOpenRef = useRef(open)
  
  // Sync local selectedEmployees with prop from main dashboard only when dialog opens
  useEffect(() => {
    // Only sync when dialog transitions from closed to open
    if (open && !prevOpenRef.current) {
      // Filter to only include employees that exist in the current data
      const validEmployees = propSelectedEmployees.filter(emp => 
        uniqueEmployees.includes(emp)
      )
      // Sync with prop when dialog opens, but allow local changes after that
      setSelectedEmployees(validEmployees)
    }
    prevOpenRef.current = open
  }, [open, propSelectedEmployees, uniqueEmployees])

  // Format the time filter display
  const timeFilterDisplay = useMemo(() => {
    if (!timePeriod) return null
    
    let dateText = timePeriod
    if (timePeriod === "Custom Dates" && dateRange?.from) {
      const fromDate = format(dateRange.from, "MMM d, yyyy")
      const toDate = dateRange.to ? format(dateRange.to, "MMM d, yyyy") : fromDate
      dateText = fromDate === toDate ? fromDate : `${fromDate} - ${toDate}`
    }
    
    let timeText = null
    if (timeRange && timeRange.startHour !== undefined && timeRange.endHour !== undefined) {
      timeText = `${formatHourTo12Hour(timeRange.startHour)} - ${formatHourTo12Hour(timeRange.endHour)}`
    }
    
    return { dateText, timeText }
  }, [timePeriod, dateRange, timeRange])

  // Get record ID for exclusion
  const getRecordId = (record: GrossIssueRecord): string => {
    return record.id?.toString() ?? ""
  }

  // Filter to only appointments where ApptSet > 0, not excluded, and matching filters
  const apptSetData = useMemo(() => {
    return data.filter((record) => {
      const recordId = getRecordId(record)
      const matchesEmployee = selectedEmployees.length === 0 || selectedEmployees.includes(record.employee)
      const matchesProduct = selectedProducts.length === 0 || selectedProducts.includes(toFilterValue(record.Productid))
      const matchesSource = selectedSources.length === 0 || selectedSources.includes(toFilterValue(record.SourceCode))
      const matchesSubSource = selectedSubSources.length === 0 || selectedSubSources.includes(toFilterValue(record.Descr))
      return (
        record.ApptSet != null &&
        record.ApptSet > 0 &&
        recordId &&
        !excludedIds.has(recordId) &&
        matchesEmployee &&
        matchesProduct &&
        matchesSource &&
        matchesSubSource
      )
    })
  }, [data, excludedIds, selectedEmployees, selectedProducts, selectedSources, selectedSubSources])

  // Pre-compute formatted dates to avoid calling formatDate during rendering
  const formattedDates = useMemo(() => {
    const dateMap = new Map<string | null, string>()
    apptSetData.forEach((record) => {
      if (!dateMap.has(record.date)) {
        dateMap.set(record.date, formatDate(record.date))
      }
    })
    return dateMap
  }, [apptSetData])

  // Calculate summary stats
  // Note: Gross Issue Rate should match dashboard calculation: (totalIssued / totalAppointments) * 100
  // where totalIssued = appointments where Issued > 0, and totalAppointments = all appointments (ApptSet > 0)
  const summaryStats = useMemo(() => {
    const totalAppointments = apptSetData.length
    const totalIssued = apptSetData.filter((record) => record.Issued != null && record.Issued > 0).length
    const totalNetIssued = apptSetData.filter((record) => record.NetIssued != null && record.NetIssued > 0).length
    // Gross Issue Rate: (Total Issued / Total Appointments) * 100
    const grossIssueRate = totalAppointments > 0 ? Math.round((totalIssued / totalAppointments) * 100) : 0
    // Net Issue Rate: (Total Net Issued / Total Appointments) * 100
    const netIssueRate = totalAppointments > 0 ? Math.round((totalNetIssued / totalAppointments) * 100) : 0
    
    return {
      totalAppointments,
      totalIssued,
      totalNetIssued,
      grossIssueRate,
      netIssueRate,
    }
  }, [apptSetData])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const hasQuery = query.length > 0
    let filtered = apptSetData.filter((record) => {
      if (!hasQuery) return true // Skip filtering when search query is empty
      
      // Use pre-computed formatted date when searching
      const formattedDate = formattedDates.get(record.date) ?? formatDate(record.date)
      return (
        (record.employee?.toLowerCase() ?? "").includes(query) ||
        (record.lds_id?.toString() ?? "").includes(query) ||
        (record.cst_id?.toString() ?? "").includes(query) ||
        (record.dsp_id?.toString() ?? "").includes(query) ||
        (record.Productid?.toString() ?? "").toLowerCase().includes(query) ||
        (record.SourceCode?.toString() ?? "").toLowerCase().includes(query) ||
        (record.Descr?.toString() ?? "").toLowerCase().includes(query) ||
        (record.NetIssued?.toString() ?? "").includes(query) ||
        formattedDate.toLowerCase().includes(query) ||
        (record.Issued != null && record.Issued > 0 ? "yes" : "no").includes(query)
      )
    })

    // Sort data
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField]
        let bValue: any = b[sortField]

        // Handle null values
        if (aValue === null || aValue === undefined) aValue = ""
        if (bValue === null || bValue === undefined) bValue = ""

        // Handle date strings
        if (sortField === "date") {
          aValue = aValue ? new Date(aValue).getTime() : 0
          bValue = bValue ? new Date(bValue).getTime() : 0
        }

        // Handle strings
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [apptSetData, searchQuery, sortField, sortDirection, formattedDates])

  // Reset to page 1 when search, sort, or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortField, sortDirection, selectedEmployees, selectedProducts, selectedSources, selectedSubSources])

  // Clear selection when dialog closes (but keep employee filter synced with main dashboard)
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRows(new Set())
      // Don't clear selectedEmployees - keep it synced with main dashboard
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push("ellipsis-start")
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortDirection === null) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    )
  }

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(
        paginatedData
          .map((record) => getRecordId(record))
          .filter((id) => id !== "")
      )
      setSelectedRows(allIds)
    } else {
      setSelectedRows(new Set())
    }
  }, [paginatedData])

  const handleSelectRow = useCallback((recordId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(recordId)
      } else {
        next.delete(recordId)
      }
      return next
    })
  }, [])

  const handleExcludeSelected = useCallback(() => {
    if (onExcludeRecords && selectedRows.size > 0) {
      onExcludeRecords(Array.from(selectedRows))
      setSelectedRows(new Set())
    }
  }, [onExcludeRecords, selectedRows])

  const handleExcludeRow = useCallback((recordId: string) => {
    if (onExcludeRecords) {
      onExcludeRecords([recordId])
    }
  }, [onExcludeRecords])

  // Determine select all checkbox state (for current page only)
  const selectAllState = useMemo(() => {
    const selectableIds = paginatedData
      .map((record) => getRecordId(record))
      .filter((id) => id !== "")
    
    if (selectableIds.length === 0) return false
    
    const selectedCount = selectableIds.filter((id) => selectedRows.has(id)).length
    if (selectedCount === 0) return false
    if (selectedCount === selectableIds.length) return true
    return "indeterminate" as const
  }, [paginatedData, selectedRows])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Gross Issue - Data Table</DialogTitle>
          <DialogDescription>
            View and search all appointments where an appointment was set (ApptSet &gt; 0) with their issue status. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          {/* Active Filters Display */}
          {timeFilterDisplay && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filters:</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {timeFilterDisplay.dateText}
              </Badge>
              {timeFilterDisplay.timeText && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeFilterDisplay.timeText}
                </Badge>
              )}
              {selectedEmployees.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {formatSelectionText(selectedEmployees, "All Employees")}
                </Badge>
              )}
              {selectedProducts.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {formatSelectionText(selectedProducts, "All Products")}
                </Badge>
              )}
              {selectedSources.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  {formatSelectionText(selectedSources, "All Sources")}
                </Badge>
              )}
              {selectedSubSources.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tags className="h-3 w-3" />
                  {formatSelectionText(selectedSubSources, "All Sub Sources")}
                </Badge>
              )}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Appointments</div>
              <div className="text-lg font-semibold">{summaryStats.totalAppointments}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Issued</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">{summaryStats.totalIssued}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Net Issued</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{summaryStats.totalNetIssued}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Gross Issue Rate</div>
              <div className="text-lg font-semibold">{summaryStats.grossIssueRate}%</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Net Issue Rate</div>
              <div className="text-lg font-semibold">{summaryStats.netIssueRate}%</div>
            </Card>
          </div>

          {/* Informational Alert - Collapsible */}
          <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <Alert 
              className={isInfoOpen ? '' : 'border-0 bg-transparent px-0 py-2'}
            >
              <Info className="h-4 w-4" />
              <div className="flex-1">
                <CollapsibleTrigger asChild>
                  <AlertTitle className="cursor-pointer hover:underline flex items-center gap-2">
                    About This Data
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isInfoOpen ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </AlertTitle>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <AlertDescription>
                    <div className="space-y-2 pt-2">
                      <p>
                        <strong>What's included:</strong> This table shows all appointments where an appointment was set (ApptSet &gt; 0) within the selected date range and filters. 
                        The gross issue rate is calculated as: (Total Issued ÷ Total ApptSet) × 100.
                      </p>
                      <p>
                        <strong>Issue Status:</strong> An appointment is considered issued when Issued &gt; 0. This indicates whether an issue occurred for an appointment that was set.
                      </p>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </Alert>
          </Collapsible>

          {/* Search Input, Filters, and Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Search by employee, date, lead ID, customer ID, Disposition, product, source, or issue status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                <MultiSelectFilter
                  label="Employee"
                  allLabel="All Employees"
                  options={uniqueEmployees}
                  selected={selectedEmployees}
                  onSelectedChange={setSelectedEmployees}
                  open={employeeSelectOpen}
                  onOpenChange={setEmployeeSelectOpen}
                  icon={<User className="h-4 w-4 mr-2 shrink-0" />}
                  widthClassName="w-full sm:w-[200px]"
                />
                <MultiSelectFilter
                  label="Product"
                  allLabel="All Products"
                  options={uniqueProducts}
                  selected={selectedProducts}
                  onSelectedChange={setSelectedProducts}
                  open={productSelectOpen}
                  onOpenChange={setProductSelectOpen}
                  icon={<Package className="h-4 w-4 mr-2 shrink-0" />}
                />
                <MultiSelectFilter
                  label="Source"
                  allLabel="All Sources"
                  options={uniqueSources}
                  selected={selectedSources}
                  onSelectedChange={setSelectedSources}
                  open={sourceSelectOpen}
                  onOpenChange={setSourceSelectOpen}
                  icon={<Radio className="h-4 w-4 mr-2 shrink-0" />}
                />
                <MultiSelectFilter
                  label="Sub Source"
                  allLabel="All Sub Sources"
                  options={uniqueSubSources}
                  selected={selectedSubSources}
                  onSelectedChange={setSelectedSubSources}
                  open={subSourceSelectOpen}
                  onOpenChange={setSubSourceSelectOpen}
                  icon={<Tags className="h-4 w-4 mr-2 shrink-0" />}
                  widthClassName="w-full sm:w-[200px]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
                Showing {filteredAndSortedData.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} records
              </div>
              {onExcludeRecords && (
                <ExcludeSelectedButton
                  selectedCount={selectedRows.size}
                  onClick={handleExcludeSelected}
                />
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {onExcludeRecords && (
                    <TableHead className="w-[50px]">
                      <SelectAllCheckbox
                        checked={selectAllState}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead className="min-w-[120px] sm:min-w-[150px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("employee")}
                    >
                      Employee
                      {getSortIcon("employee")}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[160px] sm:min-w-[180px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("date")}
                    >
                      Date/Time
                      {getSortIcon("date")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("Issued")}
                    >
                      Issued
                      {getSortIcon("Issued")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("NetIssued")}
                    >
                      Net Issued
                      {getSortIcon("NetIssued")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("lds_id")}
                    >
                      Lead ID
                      {getSortIcon("lds_id")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("cst_id")}
                    >
                      Customer ID
                      {getSortIcon("cst_id")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("dsp_id")}
                    >
                      Disposition
                      {getSortIcon("dsp_id")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("Productid")}
                    >
                      Product ID
                      {getSortIcon("Productid")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[110px] hidden md:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("SourceCode")}
                    >
                      Source
                      {getSortIcon("SourceCode")}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[140px] hidden lg:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("Descr")}
                    >
                      Sub Source
                      {getSortIcon("Descr")}
                    </Button>
                  </TableHead>
                  {onExcludeRecords && (
                    <TableHead className="w-[50px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={onExcludeRecords ? 12 : 10} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record, index) => {
                    const recordId = getRecordId(record)
                    const isSelected = recordId ? selectedRows.has(recordId) : false
                    
                    return (
                      <TableRow key={`gross-issue-${record.id ?? record.employee}-${record.date}-${startIndex + index}`}>
                        {onExcludeRecords && (
                          <TableCell>
                            <SelectionCheckbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectRow(recordId, checked)}
                              disabled={!recordId}
                              ariaLabel={`Select appointment ${record.id}`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="min-w-[120px] font-medium">
                          {record.employee || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                          {formattedDates.get(record.date) ?? formatDate(record.date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.Issued != null && record.Issued > 0 ? (
                            <span className="text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium hidden sm:table-cell">
                          {record.NetIssued != null && record.NetIssued > 0 ? (
                            <span className="text-blue-600 dark:text-blue-400">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {record.lds_id ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">
                          {record.cst_id ? (
                            <a
                              href={`https://qi09a.leadperfection.com/LeadDetail.html?custid=${record.cst_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                            >
                              {record.cst_id}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {record.dsp_id ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                          {record.Productid ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                          {record.SourceCode ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                          {record.Descr ?? "N/A"}
                        </TableCell>
                        {onExcludeRecords && (
                          <TableCell>
                            <ExcludeRowButton
                              onClick={() => handleExcludeRow(recordId)}
                              disabled={!recordId}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredAndSortedData.length > itemsPerPage && (
            <div className="flex justify-center pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                  </PaginationItem>
                  {getPageNumbers().map((page, index) => {
                    if (page === "ellipsis-start" || page === "ellipsis-end") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return (
                      <PaginationItem key={page}>
                        <Button
                          variant={currentPage === page ? "outline" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className="min-w-10"
                        >
                          {page}
                        </Button>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
