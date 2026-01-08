"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { RotateCcw, Search, Filter } from "lucide-react"
import {
  SelectionCheckbox,
  SelectAllCheckbox,
  RestoreRowButton,
  RestoreSelectedButton,
} from "./table-row-selection"
import type { ExcludedRecord, ExcludableTableType } from "@/hooks/use-excluded-records"
import { Timestamp } from "firebase/firestore"

interface ExcludedRecordsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedRecords: ExcludedRecord[]
  onRestoreRecords: (docIds: string[]) => Promise<void>
  loading?: boolean
}

// Human-readable table type labels
const tableTypeLabels: Record<ExcludableTableType, string> = {
  stl: "Checkout to Dial Time (STL)",
  conversion: "Conversion %",
  pitch: "Pitch %",
  connection: "Connection %",
  dialsPerHour: "Dials Per Hour",
  grossIssue: "Gross Issue",
  conversionQualified: "Conversion % (Qualified)",
  conversionUnqualified: "Conversion % (Un-Qualified)",
}

// Format Firestore timestamp to readable date
const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) return "N/A"
  try {
    const date = timestamp.toDate()
    return format(date, "MMM d, yyyy h:mm a")
  } catch {
    return "N/A"
  }
}

export function ExcludedRecordsPanel({
  open,
  onOpenChange,
  excludedRecords,
  onRestoreRecords,
  loading = false,
}: ExcludedRecordsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTableType, setFilterTableType] = useState<ExcludableTableType | "all">("all")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [isRestoring, setIsRestoring] = useState(false)

  // Filter records by table type and search query
  const filteredRecords = useMemo(() => {
    return excludedRecords.filter((record) => {
      // Filter by table type
      if (filterTableType !== "all" && record.tableType !== filterTableType) {
        return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const tableLabel = tableTypeLabels[record.tableType].toLowerCase()
        return (
          record.recordId.toLowerCase().includes(query) ||
          record.excludedBy.toLowerCase().includes(query) ||
          tableLabel.includes(query)
        )
      }

      return true
    })
  }, [excludedRecords, filterTableType, searchQuery])

  // Get unique table types that have excluded records
  const tableTypesWithRecords = useMemo(() => {
    const types = new Set<ExcludableTableType>()
    excludedRecords.forEach((record) => types.add(record.tableType))
    return Array.from(types).sort()
  }, [excludedRecords])

  // Clear selection when panel closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRows(new Set())
      setSearchQuery("")
      setFilterTableType("all")
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredRecords.map((record) => record.id))
      setSelectedRows(allIds)
    } else {
      setSelectedRows(new Set())
    }
  }, [filteredRecords])

  const handleSelectRow = useCallback((docId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(docId)
      } else {
        next.delete(docId)
      }
      return next
    })
  }, [])

  // Restore handlers
  const handleRestoreSelected = useCallback(async () => {
    if (selectedRows.size === 0) return
    
    setIsRestoring(true)
    try {
      await onRestoreRecords(Array.from(selectedRows))
      setSelectedRows(new Set())
    } finally {
      setIsRestoring(false)
    }
  }, [onRestoreRecords, selectedRows])

  const handleRestoreRow = useCallback(async (docId: string) => {
    setIsRestoring(true)
    try {
      await onRestoreRecords([docId])
    } finally {
      setIsRestoring(false)
    }
  }, [onRestoreRecords])

  // Determine select all checkbox state
  const selectAllState = useMemo(() => {
    if (filteredRecords.length === 0) return false
    
    const selectedCount = filteredRecords.filter((record) => selectedRows.has(record.id)).length
    if (selectedCount === 0) return false
    if (selectedCount === filteredRecords.length) return true
    return "indeterminate" as const
  }, [filteredRecords, selectedRows])

  // Count records by table type for display
  const countsByType = useMemo(() => {
    const counts: Partial<Record<ExcludableTableType, number>> = {}
    excludedRecords.forEach((record) => {
      counts[record.tableType] = (counts[record.tableType] || 0) + 1
    })
    return counts
  }, [excludedRecords])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Excluded Records
            {excludedRecords.length > 0 && (
              <Badge variant="secondary">{excludedRecords.length}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            View and restore records that have been excluded from calculations. 
            Restored records will be included again for all users.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by record ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterTableType}
              onValueChange={(value) => setFilterTableType(value as ExcludableTableType | "all")}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables ({excludedRecords.length})</SelectItem>
                {tableTypesWithRecords.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tableTypeLabels[type]} ({countsByType[type] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <RestoreSelectedButton
              selectedCount={selectedRows.size}
              onClick={handleRestoreSelected}
              disabled={isRestoring || loading}
            />
            <div className="text-sm text-muted-foreground">
              {filteredRecords.length} of {excludedRecords.length} records
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <SelectAllCheckbox
                      checked={selectAllState}
                      onCheckedChange={handleSelectAll}
                      disabled={loading || isRestoring}
                    />
                  </TableHead>
                  <TableHead className="min-w-[100px]">Record ID</TableHead>
                  <TableHead className="min-w-[150px]">Table</TableHead>
                  <TableHead className="min-w-[150px] hidden sm:table-cell">Excluded By</TableHead>
                  <TableHead className="min-w-[150px] hidden sm:table-cell">Excluded At</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading excluded records...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {excludedRecords.length === 0 
                        ? "No records have been excluded yet."
                        : "No records match your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <SelectionCheckbox
                          checked={selectedRows.has(record.id)}
                          onCheckedChange={(checked) => handleSelectRow(record.id, checked)}
                          disabled={loading || isRestoring}
                          ariaLabel={`Select record ${record.recordId}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium font-mono text-sm">
                        {record.recordId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {tableTypeLabels[record.tableType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        {record.excludedBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        {formatTimestamp(record.excludedAt)}
                      </TableCell>
                      <TableCell>
                        <RestoreRowButton
                          onClick={() => handleRestoreRow(record.id)}
                          disabled={loading || isRestoring}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground">
            Excluded records are hidden from all calculations and data tables across all users.
            Restoring a record will make it visible again for everyone.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

