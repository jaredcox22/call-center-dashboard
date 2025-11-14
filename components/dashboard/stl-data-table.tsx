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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

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
}

type SortField = "leadId" | "employee" | "stl" | "dateReceived" | "checkOutDate" | "callDate"
type SortDirection = "asc" | "desc" | null

export function STLDataTable({ data, open, onOpenChange }: STLDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("stl")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((record) => {
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
          <DialogTitle>Checkout to Dial Time - Data Table</DialogTitle>
          <DialogDescription>
            View and search all checkout to dial time records. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search by employee, lead ID, customer ID, or dates..."
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((record, index) => (
                    <TableRow key={`${record.leadId}-${index}`}>
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

