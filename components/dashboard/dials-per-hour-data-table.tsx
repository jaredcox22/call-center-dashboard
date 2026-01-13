"use client"

import { useState, useMemo, useCallback } from "react"
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

interface DialsPerHourRecord {
  employee: string
  date: string | null
  result?: string | null
  id?: number | null
}

interface DialsPerHourDataTableProps {
  data: DialsPerHourRecord[]
  totalHours: number
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedIds?: Set<string>
  onExcludeRecords?: (recordIds: string[]) => void
}

type SortField = "employee" | "date" | "result" | "id"
type SortDirection = "asc" | "desc" | null

export function DialsPerHourDataTable({ 
  data, 
  totalHours, 
  open, 
  onOpenChange,
  excludedIds = new Set(),
  onExcludeRecords,
}: DialsPerHourDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Get record ID for exclusion
  const getRecordId = (record: DialsPerHourRecord): string => {
    return record.id?.toString() ?? ""
  }

  // Calculate summary stats (from non-excluded data)
  const summaryStats = useMemo(() => {
    const nonExcludedData = data.filter((record) => {
      const recordId = getRecordId(record)
      return recordId && !excludedIds.has(recordId)
    })
    const totalDials = nonExcludedData.length
    
    return {
      totalDials,
      totalHours,
    }
  }, [data, totalHours, excludedIds])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First filter out excluded records
    let filtered = data.filter((record) => {
      const recordId = getRecordId(record)
      return recordId && !excludedIds.has(recordId)
    })

    // Then apply search filter
    filtered = filtered.filter((record) => {
      const query = searchQuery.toLowerCase()
      return (
        (record.employee?.toLowerCase() ?? "").includes(query) ||
        (record.id?.toString() ?? "").includes(query) ||
        (record.result?.toLowerCase() ?? "").includes(query) ||
        formatDate(record.date).toLowerCase().includes(query)
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
  }, [data, searchQuery, sortField, sortDirection, excludedIds])

  // Clear selection when dialog closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRows(new Set())
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

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
        filteredAndSortedData
          .map((record) => getRecordId(record))
          .filter((id) => id !== "")
      )
      setSelectedRows(allIds)
    } else {
      setSelectedRows(new Set())
    }
  }, [filteredAndSortedData])

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

  // Determine select all checkbox state
  const selectAllState = useMemo(() => {
    const selectableIds = filteredAndSortedData
      .map((record) => getRecordId(record))
      .filter((id) => id !== "")
    
    if (selectableIds.length === 0) return false
    
    const selectedCount = selectableIds.filter((id) => selectedRows.has(id)).length
    if (selectedCount === 0) return false
    if (selectedCount === selectableIds.length) return true
    return "indeterminate" as const
  }, [filteredAndSortedData, selectedRows])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Dials Per Hour - Data Table</DialogTitle>
          <DialogDescription>
            View and search all dials. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Dials</div>
              <div className="text-lg font-semibold">{summaryStats.totalDials}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Hours</div>
              <div className="text-lg font-semibold">{summaryStats.totalHours.toFixed(1)}</div>
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
                        <strong>What's included:</strong> This table shows all dials (calls) within the selected date range and filters. 
                        Dials per hour is calculated as: Total Dials ÷ Total Hours.
                      </p>
                      <p>
                        <strong>Note:</strong> The dials per hour metric is calculated based on the total number of dials and total hours worked across all selected employees and time period.
                      </p>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </Alert>
          </Collapsible>

          {/* Search Input and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search by employee, date, or call ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              {onExcludeRecords && (
                <ExcludeSelectedButton
                  selectedCount={selectedRows.size}
                  onClick={handleExcludeSelected}
                />
              )}
              <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
                {filteredAndSortedData.length} of {data.length} records
              </div>
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
                  <TableHead className="min-w-[110px] sm:min-w-[130px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("result")}
                    >
                      Result
                      {getSortIcon("result")}
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
                  {onExcludeRecords && (
                    <TableHead className="w-[50px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={onExcludeRecords ? 6 : 4} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((record) => {
                    const recordId = getRecordId(record)
                    const isSelected = recordId ? selectedRows.has(recordId) : false
                    
                    return (
                      <TableRow key={record.id ? `dials-${record.id}` : `dials-${record.employee}-${record.date}`}>
                        {onExcludeRecords && (
                          <TableCell>
                            <SelectionCheckbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectRow(recordId, checked)}
                              disabled={!recordId}
                              ariaLabel={`Select call ${record.id}`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="min-w-[120px] font-medium">
                          {record.employee || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.result ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {record.id ?? "N/A"}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
