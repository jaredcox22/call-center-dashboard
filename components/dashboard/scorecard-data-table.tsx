"use client"

import { useState, useMemo, useCallback, Fragment } from "react"
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
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
 * Strip a leading numeric prefix like "1.) ", "1) ", "1. ", "1 - " from a
 * criterion label so it doesn't duplicate the "#" column in the items table.
 */
const stripLeadingIndex = (label: string | null | undefined): string => {
  if (!label) return ""
  return label.replace(/^\s*\d+\s*[.)\-:]+\s*/, "").trim()
}

/**
 * Split a criterion label into a short title (e.g. "Introduction & Tone") and an
 * optional long description. The two are usually separated by " - " or " — ".
 * Falls back to using the whole label as the title with no description when no
 * separator is found.
 */
const splitCriterionLabel = (
  label: string | null | undefined,
): { title: string; description: string } => {
  const cleaned = stripLeadingIndex(label)
  if (!cleaned) return { title: "", description: "" }
  const match = cleaned.match(/^(.*?)\s+[-–—:]\s+(.*)$/s)
  if (match) {
    return { title: match[1].trim(), description: match[2].trim() }
  }
  return { title: cleaned, description: "" }
}

export interface ScorecardItem {
  key: string | null
  label: string | null
  max: number
  value: number
  pct: number
}

export interface ScorecardLinkedCall {
  call_id: number | string | null
  lds_id: number | string | null
  cst_id: number | string | null
  CallDate?: string | null
}

export interface ScorecardRecord {
  id?: number | string | null
  form_instance_id?: number | string | null
  form_id?: number | string | null
  status?: string | null
  callDate: string | null
  employee: string | null
  maxTotal: number
  actualTotal: number
  score: number
  items?: ScorecardItem[]
  variables?: Record<string, unknown> | null
  linkedCall?: ScorecardLinkedCall | null
}

interface ScorecardDataTableProps {
  data: ScorecardRecord[]
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  variant?: "setters" | "confirmers"
}

type SortField = "employee" | "callDate" | "callId" | "score" | "actual"
type SortDirection = "asc" | "desc" | null

const getCallIdValue = (record: ScorecardRecord): string | null => {
  const id = record.linkedCall?.call_id
  if (id === null || id === undefined) return null
  const str = String(id).trim()
  return str === "" ? null : str
}

const getScoreColor = (pct: number): string => {
  if (pct >= 90) return "text-blue-600 dark:text-blue-400"
  if (pct >= 80) return "text-green-600 dark:text-green-400"
  if (pct >= 70) return "text-yellow-600 dark:text-yellow-400"
  if (pct >= 60) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

const getProspectLabel = (record: ScorecardRecord): string => {
  const v = record.variables ?? {}
  const tryStr = (val: unknown): string | null => {
    if (typeof val === "string" && val.trim() !== "") return val.trim()
    if (typeof val === "number") return String(val)
    return null
  }

  const fullName =
    tryStr((v as any).ProspectName) ||
    tryStr((v as any).CustomerName) ||
    tryStr((v as any).LeadName)
  if (fullName) return fullName

  const first =
    tryStr((v as any).ProspectFirstName) ||
    tryStr((v as any).CustomerFirstName) ||
    tryStr((v as any).LeadFirstName) ||
    tryStr((v as any).FirstName)
  const last =
    tryStr((v as any).ProspectLastName) ||
    tryStr((v as any).CustomerLastName) ||
    tryStr((v as any).LeadLastName) ||
    tryStr((v as any).LastName)
  if (first && last) return `${first} ${last}`

  const lds =
    tryStr((v as any).lds_id) ||
    tryStr((v as any).LeadId) ||
    tryStr((v as any).leadId) ||
    tryStr(record.linkedCall?.lds_id)
  if (lds) return `Lead #${lds}`

  const appt =
    tryStr((v as any).AppointmentId) ||
    tryStr((v as any).ApptId) ||
    tryStr((v as any).appointment_id)
  if (appt) return `Appt #${appt}`

  const cst =
    tryStr((v as any).cst_id) ||
    tryStr((v as any).CustomerId) ||
    tryStr(record.linkedCall?.cst_id)
  if (cst) return `Customer #${cst}`

  return "—"
}

const getRowKey = (record: ScorecardRecord, index: number): string => {
  return record.form_instance_id != null
    ? `fi-${record.form_instance_id}`
    : record.id != null
      ? `id-${record.id}`
      : `idx-${index}`
}

export function ScorecardDataTable({
  data,
  open,
  onOpenChange,
  title = "Scorecard - Data Table",
  variant = "confirmers",
}: ScorecardDataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("callDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const summaryStats = useMemo(() => {
    const total = data.length
    const avgPerScorecard =
      total > 0
        ? Math.round(data.reduce((s, r) => s + (r.score || 0), 0) / total)
        : 0
    return { total, avgPerScorecard }
  }, [data])

  const filteredAndSortedData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let filtered = data
    if (q) {
      filtered = data.filter((record) => {
        const prospect = getProspectLabel(record).toLowerCase()
        const callId = getCallIdValue(record) ?? ""
        return (
          (record.employee?.toLowerCase() ?? "").includes(q) ||
          (record.id?.toString() ?? "").includes(q) ||
          (record.form_instance_id?.toString() ?? "").includes(q) ||
          formatDate(record.callDate).toLowerCase().includes(q) ||
          prospect.includes(q) ||
          callId.toLowerCase().includes(q) ||
          String(record.score).includes(q)
        )
      })
    }

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: number | string = ""
        let bValue: number | string = ""

        switch (sortField) {
          case "employee":
            aValue = (a.employee ?? "").toLowerCase()
            bValue = (b.employee ?? "").toLowerCase()
            break
          case "callDate":
            aValue = a.callDate ? new Date(a.callDate).getTime() : 0
            bValue = b.callDate ? new Date(b.callDate).getTime() : 0
            break
          case "callId": {
            const aCall = getCallIdValue(a)
            const bCall = getCallIdValue(b)
            const aNum = aCall != null ? Number(aCall) : NaN
            const bNum = bCall != null ? Number(bCall) : NaN
            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
              aValue = aNum
              bValue = bNum
            } else {
              aValue = aCall ?? ""
              bValue = bCall ?? ""
            }
            break
          }
          case "score":
            aValue = a.score ?? 0
            bValue = b.score ?? 0
            break
          case "actual":
            aValue = a.actualTotal ?? 0
            bValue = b.actualTotal ?? 0
            break
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchQuery, sortField, sortDirection])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setExpandedRows(new Set())
      }
      onOpenChange(newOpen)
    },
    [onOpenChange],
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc")
      else if (sortDirection === "desc") setSortDirection(null)
      else setSortDirection("asc")
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

  const toggleRow = (rowKey: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowKey)) next.delete(rowKey)
      else next.add(rowKey)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            View every completed {variant === "setters" ? "setter" : "confirmer"} scorecard for the
            selected date range. Click a row to see the individual criterion scores
            and the prospect/appointment it was scored from.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Scorecards</div>
              <div className="text-lg font-semibold">{summaryStats.total}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Avg / Scorecard
              </div>
              <div
                className={`text-lg font-semibold ${getScoreColor(summaryStats.avgPerScorecard)}`}
              >
                {summaryStats.avgPerScorecard}%
              </div>
            </Card>
          </div>

          <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <Alert
              className={
                isInfoOpen ? "" : "border-0 bg-transparent px-0 py-2"
              }
            >
              <Info className="h-4 w-4" />
              <div className="flex-1">
                <CollapsibleTrigger asChild>
                  <AlertTitle className="cursor-pointer hover:underline flex items-center gap-2">
                    About This Data
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isInfoOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </AlertTitle>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <AlertDescription>
                    <div className="space-y-2 pt-2">
                      <p>
                        <strong>What's included:</strong> Each row is one
                        completed scorecard from the integrity form_instances
                        table for the selected date range and employee filter.
                        The aggregate gauge percentage is{" "}
                        <code>(Σ actualTotal ÷ Σ maxTotal) × 100</code>.
                      </p>
                      <p>
                        <strong>Click a row</strong> to expand and see each
                        individual criterion score that contributed to the total.
                        The prospect/appointment shown comes from variables
                        captured on the form when scored, with a fallback to the
                        nearest matching call within ±2 minutes if no explicit
                        prospect identifier was stored.
                      </p>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </Alert>
          </Collapsible>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search by employee, call id, score, or scorecard id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
              {filteredAndSortedData.length} of {data.length} scorecards
            </div>
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead className="min-w-[140px] sm:min-w-[170px]">
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
                      onClick={() => handleSort("callDate")}
                    >
                      Call Date
                      {getSortIcon("callDate")}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("callId")}
                    >
                      Call ID
                      {getSortIcon("callId")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px] hidden sm:table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("actual")}
                    >
                      Actual / Max
                      {getSortIcon("actual")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-2"
                      onClick={() => handleSort("score")}
                    >
                      Score %
                      {getSortIcon("score")}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery
                        ? "No scorecards match your search."
                        : "No scorecards available."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((record, index) => {
                    const rowKey = getRowKey(record, index)
                    const isExpanded = expandedRows.has(rowKey)
                    const items = record.items ?? []
                    const prospectLabel = getProspectLabel(record)
                    const linkedLds =
                      record.linkedCall?.lds_id ??
                      (record.variables as any)?.lds_id ??
                      null
                    const callIdValue = getCallIdValue(record)

                    return (
                      <Fragment key={rowKey}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRow(rowKey)}
                        >
                          <TableCell className="w-[40px] py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleRow(rowKey)
                              }}
                              aria-label={
                                isExpanded ? "Collapse row" : "Expand row"
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium min-w-[140px]">
                            {record.employee || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground min-w-[160px]">
                            {formatDate(record.callDate)}
                          </TableCell>
                          <TableCell className="text-sm min-w-[120px]">
                            {callIdValue ? (
                              <span className="font-mono">{callIdValue}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm hidden sm:table-cell">
                            {Math.round(record.actualTotal)} /{" "}
                            {Math.round(record.maxTotal)}
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${getScoreColor(record.score)}`}
                          >
                            {record.score}%
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="px-6 py-4">
                                {items.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No per-criterion details available for this
                                    scorecard.
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                      <span>
                                        <strong className="text-foreground">
                                          {items.length}
                                        </strong>{" "}
                                        criteria scored
                                      </span>
                                      {record.callDate && (
                                        <span>
                                          • Call:{" "}
                                          <strong className="text-foreground">
                                            {formatDate(record.callDate)}
                                          </strong>
                                        </span>
                                      )}
                                      {record.linkedCall?.call_id && (
                                        <span>
                                          • Call ID:{" "}
                                          <strong className="text-foreground">
                                            {String(record.linkedCall.call_id)}
                                          </strong>
                                        </span>
                                      )}
                                      {linkedLds && (
                                        <span>
                                          • Lead:{" "}
                                          <strong className="text-foreground">
                                            #{String(linkedLds)}
                                          </strong>
                                        </span>
                                      )}
                                      {record.linkedCall?.cst_id && (
                                        <span>
                                          • Customer:{" "}
                                          <strong className="text-foreground">
                                            #{String(record.linkedCall.cst_id)}
                                          </strong>
                                        </span>
                                      )}
                                      {prospectLabel !== "—" &&
                                        prospectLabel !==
                                          (linkedLds
                                            ? `Lead #${linkedLds}`
                                            : "") &&
                                        !prospectLabel.startsWith("Customer #") && (
                                          <span>
                                            • Prospect:{" "}
                                            <strong className="text-foreground">
                                              {prospectLabel}
                                            </strong>
                                          </span>
                                        )}
                                    </div>
                                    <TooltipProvider delayDuration={200}>
                                      <div className="overflow-hidden rounded border bg-background">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="w-[60px]">
                                                #
                                              </TableHead>
                                              <TableHead>Criterion</TableHead>
                                              <TableHead className="w-[140px] text-right">
                                                Score
                                              </TableHead>
                                              <TableHead className="w-[90px] text-right">
                                                %
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {items.map((item, itemIdx) => {
                                              const { title, description } =
                                                splitCriterionLabel(item.label)
                                              const fullText =
                                                stripLeadingIndex(item.label) ||
                                                item.key ||
                                                "Untitled"
                                              const titleText =
                                                title || item.key || "Untitled"
                                              return (
                                                <TableRow
                                                  key={`${rowKey}-item-${itemIdx}`}
                                                >
                                                  <TableCell className="text-muted-foreground text-xs">
                                                    {itemIdx + 1}
                                                  </TableCell>
                                                  <TableCell className="text-sm">
                                                    {description ? (
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <span className="cursor-help underline decoration-dotted underline-offset-4 decoration-muted-foreground/60">
                                                            {titleText}
                                                          </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                          side="top"
                                                          align="start"
                                                          className="max-w-md whitespace-normal wrap-break-word text-left"
                                                        >
                                                          {fullText}
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    ) : (
                                                      <span>{titleText}</span>
                                                    )}
                                                  </TableCell>
                                                  <TableCell className="text-right text-sm">
                                                    {Math.round(item.value)} /{" "}
                                                    {Math.round(item.max)}
                                                  </TableCell>
                                                  <TableCell
                                                    className={`text-right text-sm font-semibold ${getScoreColor(item.pct)}`}
                                                  >
                                                    {Math.round(item.pct)}%
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            })}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </TooltipProvider>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
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
