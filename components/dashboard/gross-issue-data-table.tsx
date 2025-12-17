"use client"

import { useState, useMemo, useEffect, startTransition } from "react"
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
import { ArrowUpDown, ArrowUp, ArrowDown, Info, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

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

interface GrossIssueRecord {
  employee: string
  date: string | null
  ApptSet: number | null
  Issued: number | null
  id?: number | null
}

interface GrossIssueDataTableProps {
  data: GrossIssueRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SortField = "employee" | "date" | "ApptSet" | "Issued" | "id"
type SortDirection = "asc" | "desc" | null

export function GrossIssueDataTable({ data, open, onOpenChange }: GrossIssueDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50 // Render only 50 rows at a time to prevent blocking

  // Filter to only calls where ApptSet > 0
  const apptSetData = useMemo(() => {
    return data.filter((record) => record.ApptSet != null && record.ApptSet > 0)
  }, [data])

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
  const summaryStats = useMemo(() => {
    const totalApptSet = apptSetData.length
    const totalIssued = apptSetData.filter((record) => record.Issued != null && record.Issued > 0).length
    const grossIssueRate = totalApptSet > 0 ? Math.round((totalIssued / totalApptSet) * 100) : 0
    
    return {
      totalApptSet,
      totalIssued,
      grossIssueRate,
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
        (record.id?.toString() ?? "").includes(query) ||
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

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortField, sortDirection])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Gross Issue - Data Table</DialogTitle>
          <DialogDescription>
            View and search all calls where an appointment was set (ApptSet &gt; 0) with their issue status. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Appt Set</div>
              <div className="text-lg font-semibold">{summaryStats.totalApptSet}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Issued</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">{summaryStats.totalIssued}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Gross Issue Rate</div>
              <div className="text-lg font-semibold">{summaryStats.grossIssueRate}%</div>
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
                        <strong>What's included:</strong> This table shows all calls where an appointment was set (ApptSet &gt; 0) within the selected date range and filters. 
                        The gross issue rate is calculated as: (Total Issued ÷ Total ApptSet) × 100.
                      </p>
                      <p>
                        <strong>Issue Status:</strong> A call is considered issued when Issued &gt; 0. This indicates whether an issue occurred for an appointment that was set.
                      </p>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </Alert>
          </Collapsible>

          {/* Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search by employee, date, call ID, or issue status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} records
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
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
                      onClick={() => handleSort("id")}
                    >
                      Call ID
                      {getSortIcon("id")}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record, index) => (
                    <TableRow key={`gross-issue-${record.id ?? record.employee}-${record.date}-${startIndex + index}`}>
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
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        {record.id ?? "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
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
