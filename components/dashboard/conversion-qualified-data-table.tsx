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
import { ArrowUpDown, ArrowUp, ArrowDown, Info, ChevronDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
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

interface ConversionQualifiedRecord {
  employee: string
  date: string | null
  pitched: number
  positive: number
  qualified: boolean | null
  id?: number | null
  lds_id?: number | null
  cst_id?: number | null
  cqd_id?: number | null
}

interface CallQueueDetail {
  id?: number | null
  cqd_id?: number | null
  Descr?: string
}

function getAllCallBucketValues(callQueueDetails: CallQueueDetail[] = []): string[] {
  const sorted = [...callQueueDetails].sort((a, b) => (a.Descr ?? "").localeCompare(b.Descr ?? ""))
  return ["none", ...sorted.map((q) => String(q.id ?? q.cqd_id))]
}

function formatCallBucketSelectionText(selectedCallBuckets: string[], callQueueDetails: CallQueueDetail[] = []): string {
  const allValues = getAllCallBucketValues(callQueueDetails)
  const allSelected = allValues.length > 0 && selectedCallBuckets.length === allValues.length && allValues.every((v) => selectedCallBuckets.includes(v))
  if (selectedCallBuckets.length === 0 || allSelected) return "All Call Buckets"
  const labels = selectedCallBuckets.map((v) => {
    if (v === "none") return "No Call Bucket"
    const item = callQueueDetails.find((q) => String(q.id ?? q.cqd_id) === v)
    return item?.Descr ?? v
  })
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`
  return `${labels.length} selected`
}

interface ConversionQualifiedDataTableProps {
  data: ConversionQualifiedRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
  excludedIds?: Set<string>
  onExcludeRecords?: (recordIds: string[]) => void
  callQueueDetails?: CallQueueDetail[]
  selectedCallBuckets?: string[]
  onSelectedCallBucketsChange?: (ids: string[]) => void
}

type SortField = "employee" | "date" | "positive" | "qualified" | "id" | "lds_id" | "cst_id" | "cqd_id"
type SortDirection = "asc" | "desc" | null

function getCallBucketLabel(cqdId: number | null | undefined, callQueueDetails: CallQueueDetail[] = []): string {
  if (cqdId == null || cqdId === 0) return "No Call Bucket"
  const item = callQueueDetails.find((q) => Number(q.id ?? q.cqd_id) === Number(cqdId))
  return item?.Descr ?? String(cqdId)
}

export function ConversionQualifiedDataTable({ 
  data, 
  open, 
  onOpenChange,
  excludedIds = new Set(),
  onExcludeRecords,
  callQueueDetails = [],
  selectedCallBuckets = [],
  onSelectedCallBucketsChange,
}: ConversionQualifiedDataTableProps) {
  const [callBucketOpen, setCallBucketOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Get record ID for exclusion
  const getRecordId = (record: ConversionQualifiedRecord): string => {
    return record.id?.toString() ?? ""
  }

  // Filter to only qualified conversions (qualified === true) and not excluded
  const qualifiedData = useMemo(() => {
    return data.filter((record) => {
      const recordId = getRecordId(record)
      return record.qualified === true && recordId && !excludedIds.has(recordId)
    })
  }, [data, excludedIds])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    // Total pitched calls (excluding excluded records)
    const nonExcludedData = data.filter((record) => {
      const recordId = getRecordId(record)
      return recordId && !excludedIds.has(recordId)
    })
    const totalPitches = nonExcludedData.length
    const totalQualified = qualifiedData.length
    const totalConversions = qualifiedData.filter((record) => record.positive === 1).length
    const conversionRate = totalQualified > 0 ? Math.round((totalConversions / totalQualified) * 100) : 0
    
    return {
      totalPitches,
      totalQualified,
      totalConversions,
      conversionRate,
    }
  }, [data, qualifiedData, excludedIds])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = qualifiedData.filter((record) => {
      const query = searchQuery.toLowerCase()
      return (
        (record.employee?.toLowerCase() ?? "").includes(query) ||
        (record.id?.toString() ?? "").includes(query) ||
        (record.lds_id?.toString() ?? "").includes(query) ||
        (record.cst_id?.toString() ?? "").includes(query) ||
        getCallBucketLabel(record.cqd_id, callQueueDetails).toLowerCase().includes(query) ||
        formatDate(record.date).toLowerCase().includes(query) ||
        (record.positive === 1 ? "yes" : "no").includes(query)
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

        // Handle cqd_id: sort by label for display consistency
        if (sortField === "cqd_id") {
          aValue = getCallBucketLabel(a.cqd_id, callQueueDetails)
          bValue = getCallBucketLabel(b.cqd_id, callQueueDetails)
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
  }, [qualifiedData, searchQuery, sortField, sortDirection, callQueueDetails])

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
          <DialogTitle>Conversion % (Qualified) - Data Table</DialogTitle>
          <DialogDescription>
            View and search all qualified pitched calls with their conversion status. Click column headers to sort.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Pitches</div>
              <div className="text-lg font-semibold">{summaryStats.totalPitches}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Qualified</div>
              <div className="text-lg font-semibold">{summaryStats.totalQualified}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Conversions</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">{summaryStats.totalConversions}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
              <div className="text-lg font-semibold">{summaryStats.conversionRate}%</div>
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
                        <strong>What's included:</strong> This table shows all calls where a pitch was made (pitched = 1) and the conversion was qualified (qualified = true) within the selected date range and filters. 
                        The conversion rate is calculated as: (Total Qualified Conversions ÷ Total Qualified Calls) × 100.
                      </p>
                      <p>
                        <strong>Qualified Conversion:</strong> A qualified conversion is a call where qualified = true. This indicates that the conversion met the qualification criteria.
                      </p>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </Alert>
          </Collapsible>

          {/* Search Input, Call Bucket Filter, and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search by employee, date, call ID, lead ID, customer ID, or conversion status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {onSelectedCallBucketsChange && (
              <Popover open={callBucketOpen} onOpenChange={setCallBucketOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 shrink-0 justify-between font-normal min-w-[160px]">
                    <span className="truncate text-left flex-1">{formatCallBucketSelectionText(selectedCallBuckets, callQueueDetails)}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <div className="p-2 max-h-[300px] overflow-auto">
                    <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                      {(() => {
                        const allBucketValues = getAllCallBucketValues(callQueueDetails)
                        const allSelected = allBucketValues.length > 0 && selectedCallBuckets.length === allBucketValues.length && allBucketValues.every((v) => selectedCallBuckets.includes(v))
                        const allCheckboxChecked = selectedCallBuckets.length === 0 || allSelected
                        return (
                          <>
                            <Checkbox
                              checked={allCheckboxChecked}
                              onCheckedChange={(checked) => {
                                if (checked) onSelectedCallBucketsChange([...allBucketValues])
                                else onSelectedCallBucketsChange([])
                              }}
                            />
                            <label className="text-sm font-medium leading-none cursor-pointer flex-1" onClick={() => { if (allCheckboxChecked) onSelectedCallBucketsChange([]); else onSelectedCallBucketsChange([...allBucketValues]) }}>All Call Buckets</label>
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                      <Checkbox checked={selectedCallBuckets.includes("none")} onCheckedChange={(c) => { if (c) onSelectedCallBucketsChange(selectedCallBuckets.includes("none") ? selectedCallBuckets : [...selectedCallBuckets, "none"]); else onSelectedCallBucketsChange(selectedCallBuckets.filter((v) => v !== "none")) }} />
                      <label className="text-sm font-medium leading-none cursor-pointer flex-1" onClick={() => onSelectedCallBucketsChange(selectedCallBuckets.includes("none") ? selectedCallBuckets.filter((v) => v !== "none") : [...selectedCallBuckets, "none"])}>No Call Bucket</label>
                    </div>
                    {[...callQueueDetails].sort((a: CallQueueDetail, b: CallQueueDetail) => (a.Descr ?? "").localeCompare(b.Descr ?? "")).map((item: CallQueueDetail) => {
                      const value = String(item.id ?? item.cqd_id)
                      const checked = selectedCallBuckets.includes(value)
                      return (
                        <div key={value} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
                          <Checkbox checked={checked} onCheckedChange={(c) => { if (c) onSelectedCallBucketsChange(selectedCallBuckets.includes(value) ? selectedCallBuckets : [...selectedCallBuckets, value]); else onSelectedCallBucketsChange(selectedCallBuckets.filter((v) => v !== value)) }} />
                          <label className="text-sm font-medium leading-none cursor-pointer flex-1" onClick={() => onSelectedCallBucketsChange(selectedCallBuckets.includes(value) ? selectedCallBuckets.filter((v) => v !== value) : [...selectedCallBuckets, value])}>{item.Descr ?? value}</label>
                        </div>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <div className="flex items-center gap-2">
              {onExcludeRecords && (
                <ExcludeSelectedButton
                  selectedCount={selectedRows.size}
                  onClick={handleExcludeSelected}
                />
              )}
              <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
                {filteredAndSortedData.length} of {qualifiedData.length} records
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
                  <TableHead className="w-[120px] hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("cqd_id")}
                    >
                      Call Bucket
                      {getSortIcon("cqd_id")}
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
                    <TableCell colSpan={onExcludeRecords ? 9 : 7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No records found matching your search." : "No data available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((record, index) => {
                    const recordId = getRecordId(record)
                    const isSelected = recordId ? selectedRows.has(recordId) : false
                    
                    return (
                      <TableRow key={`qualified-${record.employee}-${record.date}-${index}`}>
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
                        <TableCell className="font-medium">
                          {record.positive === 1 ? (
                            <span className="text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {record.id ?? "N/A"}
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
                          {getCallBucketLabel(record.cqd_id, callQueueDetails)}
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
