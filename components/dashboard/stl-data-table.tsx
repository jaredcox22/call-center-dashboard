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
import {
  SelectionCheckbox,
  SelectAllCheckbox,
  ExcludeRowButton,
  ExcludeSelectedButton,
} from "./table-row-selection"

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

interface STLRecord {
  leadId: number | null
  employee: string
  stl: number
  cst_id: number | null
  dateReceived: string | null
  checkOutDate: string | null
  callDate: string | null
}

interface STLDataTableProps {
  data: STLRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedIds?: Set<string>
  onExcludeRecords?: (recordIds: string[]) => void
}

type SortField = "leadId" | "employee" | "stl" | "dateReceived" | "checkOutDate" | "callDate"
type SortDirection = "asc" | "desc" | null

export function STLDataTable({ 
  data, 
  open, 
  onOpenChange,
  excludedIds = new Set(),
  onExcludeRecords,
}: STLDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("stl")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Get record ID for exclusion (using leadId)
  const getRecordId = (record: STLRecord): string => {
    return record.leadId?.toString() ?? ""
  }

  // Filter out excluded records and apply search/sort
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
        record.employee?.toLowerCase().includes(query) ||
        record.leadId?.toString().includes(query) ||
        record.cst_id?.toString().includes(query) ||
        formatDate(record.dateReceived).toLowerCase().includes(query) ||
        formatDate(record.checkOutDate).toLowerCase().includes(query) ||
        formatDate(record.callDate).toLowerCase().includes(query)
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
        if (sortField === "dateReceived" || sortField === "checkOutDate" || sortField === "callDate") {
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
          <DialogTitle>Checkout to Dial Time - Data Table</DialogTitle>
          <DialogDescription>
            View and search all checkout to dial time records. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
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
                        <strong>What's included:</strong> This table shows records where a lead was checked out within the selected date range, 
                        has a received date (inbound lead), and has a valid call date (first call that's not a "no dial" result code). 
                        Certain source records are excluded per business rules.
                      </p>
                      <div>
                        <p className="mb-1">
                          <strong>Call Center Business Hours:</strong> The STL calculation only counts time during active business hours:
                        </p>
                        <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                          <li>Monday - Thursday: 8:30 AM - 7:00 PM</li>
                          <li>Friday: 8:30 AM - 5:00 PM</li>
                          <li>Saturday: 10:30 AM - 1:00 PM</li>
                          <li>Sunday: Closed</li>
                        </ul>
                      </div>
                      <p>
                        <strong>Note about 0-second values:</strong> Records with 0 seconds STL time are excluded from the average calculation 
                        shown in the metric card. These occur when the checkout date and call date both fall outside active business hours 
                        (e.g., both before opening or after closing). Only active business hours are counted in the STL calculation to 
                        provide an accurate measure of operational speed.
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
              placeholder="Search by employee, lead ID, customer ID, or dates..."
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
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("leadId")}
                    >
                      Lead ID
                      {getSortIcon("leadId")}
                    </Button>
                  </TableHead>
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
                  <TableHead className="w-[100px] sm:w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("stl")}
                    >
                      STL Time
                      {getSortIcon("stl")}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[160px] sm:min-w-[180px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("dateReceived")}
                    >
                      Date Received
                      {getSortIcon("dateReceived")}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[160px] sm:min-w-[180px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("checkOutDate")}
                    >
                      Checkout Date
                      {getSortIcon("checkOutDate")}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[160px] sm:min-w-[180px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("callDate")}
                    >
                      Call Date
                      {getSortIcon("callDate")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] hidden sm:table-cell">Customer ID</TableHead>
                  {onExcludeRecords && (
                    <TableHead className="w-[50px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={onExcludeRecords ? 9 : 7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((record, index) => {
                    const recordId = getRecordId(record)
                    const isSelected = recordId ? selectedRows.has(recordId) : false
                    
                    return (
                      <TableRow key={`${record.leadId}-${index}`}>
                        {onExcludeRecords && (
                          <TableCell>
                            <SelectionCheckbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectRow(recordId, checked)}
                              disabled={!recordId}
                              ariaLabel={`Select lead ${record.leadId}`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {record.leadId ?? "N/A"}
                        </TableCell>
                        <TableCell className="min-w-[120px]">{record.employee || "N/A"}</TableCell>
                        <TableCell className="font-medium">
                          {formatSecondsToMinutes(record.stl)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                          {formatDate(record.dateReceived)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                          {formatDate(record.checkOutDate)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                          {formatDate(record.callDate)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {record.cst_id ?? "N/A"}
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
