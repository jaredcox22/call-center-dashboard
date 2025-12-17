"use client"

import { useState, useMemo } from "react"
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
import { ArrowUpDown, ArrowUp, ArrowDown, Info, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"

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

interface ConversionRecord {
  employee: string
  date: string | null
  pitched: number
  positive: number
  qualified: boolean | null
  id?: number | null
}

interface ConversionDataTableProps {
  data: ConversionRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SortField = "employee" | "date" | "positive" | "qualified" | "id"
type SortDirection = "asc" | "desc" | null

export function ConversionDataTable({ data, open, onOpenChange }: ConversionDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalPitched = data.length
    const totalConversions = data.filter((record) => record.positive === 1).length
    const conversionRate = totalPitched > 0 ? Math.round((totalConversions / totalPitched) * 100) : 0
    const totalQualified = data.filter((record) => record.qualified === true).length
    const totalUnqualified = data.filter((record) => record.qualified === false && record.positive === 1).length
    
    return {
      totalPitched,
      totalConversions,
      conversionRate,
      totalQualified,
      totalUnqualified,
    }
  }, [data])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((record) => {
      const query = searchQuery.toLowerCase()
      return (
        (record.employee?.toLowerCase() ?? "").includes(query) ||
        (record.id?.toString() ?? "").includes(query) ||
        formatDate(record.date).toLowerCase().includes(query) ||
        (record.positive === 1 ? "yes" : "no").includes(query) ||
        (record.qualified === true ? "yes" : record.qualified === false ? "no" : "n/a").includes(query)
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
  }, [data, searchQuery, sortField, sortDirection])

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
          <DialogTitle>Conversion % - Data Table</DialogTitle>
          <DialogDescription>
            View and search all pitched calls with their conversion status. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Pitched</div>
              <div className="text-lg font-semibold">{summaryStats.totalPitched}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Conversions</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">{summaryStats.totalConversions}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
              <div className="text-lg font-semibold">{summaryStats.conversionRate}%</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Qualified</div>
              <div className="text-lg font-semibold">{summaryStats.totalQualified}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Unqualified</div>
              <div className="text-lg font-semibold">{summaryStats.totalUnqualified}</div>
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
                        <strong>What's included:</strong> This table shows all calls where a pitch was made (pitched = 1) within the selected date range and filters. 
                        The conversion rate is calculated as: (Total Positive ÷ Total Pitched) × 100.
                      </p>
                      <p>
                        <strong>Conversion Status:</strong> A call is considered a conversion when positive = 1. The qualified field indicates whether 
                        the conversion was qualified (true) or unqualified (false). If qualified is null, the conversion status may not have been determined.
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
              placeholder="Search by employee, date, call ID, or conversion status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
              {filteredAndSortedData.length} of {data.length} records
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
                      onClick={() => handleSort("positive")}
                    >
                      Conversion
                      {getSortIcon("positive")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("qualified")}
                    >
                      Qualified
                      {getSortIcon("qualified")}
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((record, index) => (
                    <TableRow key={`${record.employee}-${record.date}-${index}`}>
                      <TableCell className="min-w-[120px] font-medium">
                        {record.employee || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.positive === 1 ? (
                          <span className="text-green-600 dark:text-green-400">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.qualified === true ? (
                          <span className="text-green-600 dark:text-green-400">Yes</span>
                        ) : record.qualified === false ? (
                          <span className="text-orange-600 dark:text-orange-400">No</span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
