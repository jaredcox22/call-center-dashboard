/**
 * Shared shape of the dashboard's pre-aggregated call data.
 *
 * The live API (ccHorsepower.php) aggregates calls server-side because a
 * year-to-date window is well over a hundred thousand rows, roughly 200x the size
 * of the buckets the metric cards actually need. The helpers here mirror that
 * server logic so the demo fixture, which ships raw rows, can serve the same
 * response shape.
 */

/** Table types whose rows are fetched on demand, only while the table is open. */
export type DrilldownTable =
  | "connection"
  | "pitch"
  | "conversion"
  | "dialsPerHour"
  | "conversionQualified"
  | "conversionUnqualified"

/**
 * One slice of calls grouped by the only dimensions the dashboard filters on:
 * employee (index into employeeNames), hour of day, call bucket (cqd_id, 0 = none)
 * and qualified (1 yes / 0 no / -1 unknown).
 *
 * Counters: d dials, c connected, p pitched, v positive,
 * pv pitched & positive, a appointments set, i issued.
 */
export type CallAggregateBucket = {
  e: number; h: number; b: number; q: number
  d: number; c: number; p: number; v: number; pv: number; a: number; i: number
}

export type CallAggregate = {
  employeeNames: string[]
  buckets: CallAggregateBucket[]
  /** Excluded calls falling in this window, so the exclusions panel stays accurate. */
  excludedRows?: any[]
}

export const EMPTY_CALL_AGGREGATE: CallAggregate = {
  employeeNames: [],
  buckets: [],
  excludedRows: [],
}

export type CallTotals = {
  dials: number; connected: number; pitched: number; positive: number
  qualified: number; unqualified: number
  qualifiedConversions: number; unqualifiedConversions: number
  apptSet: number; issued: number
}

export type EmployeeCallTotals = { dials: number; connected: number; pitched: number; positive: number }

export type TimeRangeFilter = { startHour: number | undefined; endHour: number | undefined }

/** 'YYYY-MM-DD HH:mm:ss' -> hour of day, matching the server's substring read. */
const hourOf = (date: unknown): number => Number(String(date ?? "").slice(11, 13)) || 0

/**
 * Whether an hour falls in the selected range.
 * Inclusive of start, exclusive of end, where an end of 0 means midnight (24).
 */
export function isHourInTimeRange(
  hour: number,
  startHour: number | undefined,
  endHour: number | undefined
): boolean {
  if (startHour === undefined || endHour === undefined) {
    return true // All Day - include all hours
  }
  const effectiveEndHour = endHour === 0 ? 24 : endHour
  return hour >= startHour && hour < effectiveEndHour
}

const emptyCallTotals = (): CallTotals => ({
  dials: 0, connected: 0, pitched: 0, positive: 0,
  qualified: 0, unqualified: 0, qualifiedConversions: 0, unqualifiedConversions: 0,
  apptSet: 0, issued: 0,
})

/**
 * Sums the aggregate buckets that pass the current employee, hour-of-day and
 * call-bucket filters. Replaces scanning every raw call row, which for a
 * year-to-date window was well over a hundred thousand rows per render.
 */
export function summarizeCallAggregate(
  aggregate: CallAggregate | undefined,
  selectedEmployees: string[],
  timeRange?: TimeRangeFilter,
  selectedCallBuckets?: string[]
): { totals: CallTotals; byEmployee: Map<string, EmployeeCallTotals> } {
  const totals = emptyCallTotals()
  const byEmployee = new Map<string, EmployeeCallTotals>()
  if (!aggregate || !Array.isArray(aggregate.buckets)) {
    return { totals, byEmployee }
  }

  const { employeeNames, buckets } = aggregate
  const allowedEmployees = selectedEmployees.length > 0 ? new Set(selectedEmployees) : null
  const filterHours = Boolean(timeRange && (timeRange.startHour !== undefined || timeRange.endHour !== undefined))

  let allowedBucketIds: Set<number> | null = null
  let allowNoBucket = false
  if (selectedCallBuckets && selectedCallBuckets.length > 0 && !selectedCallBuckets.includes("all")) {
    allowNoBucket = selectedCallBuckets.includes("none")
    allowedBucketIds = new Set(selectedCallBuckets.filter((v) => v !== "none").map((v) => Number(v)))
  }

  for (const bucket of buckets) {
    if (filterHours && !isHourInTimeRange(bucket.h, timeRange!.startHour, timeRange!.endHour)) continue
    if (allowedBucketIds) {
      if (bucket.b === 0) {
        if (!allowNoBucket) continue
      } else if (!allowedBucketIds.has(bucket.b)) {
        continue
      }
    }
    const employeeName = employeeNames[bucket.e]
    if (allowedEmployees && !allowedEmployees.has(employeeName)) continue

    totals.dials += bucket.d
    totals.connected += bucket.c
    totals.pitched += bucket.p
    totals.positive += bucket.v
    totals.apptSet += bucket.a
    totals.issued += bucket.i
    if (bucket.q === 1) {
      totals.qualified += bucket.p
      totals.qualifiedConversions += bucket.pv
    } else if (bucket.q === 0) {
      totals.unqualified += bucket.p
      totals.unqualifiedConversions += bucket.pv
    }

    let employeeTotals = byEmployee.get(employeeName)
    if (!employeeTotals) {
      employeeTotals = { dials: 0, connected: 0, pitched: 0, positive: 0 }
      byEmployee.set(employeeName, employeeTotals)
    }
    employeeTotals.dials += bucket.d
    employeeTotals.connected += bucket.c
    employeeTotals.pitched += bucket.p
    employeeTotals.positive += bucket.v
  }

  return { totals, byEmployee }
}

export function aggregateCallRows(rows: any[], excludedCallIds: Set<string> = new Set()): CallAggregate {
  const employeeNames: string[] = []
  const nameIndex = new Map<string, number>()
  const buckets = new Map<string, CallAggregateBucket>()
  const excludedRows: any[] = []

  if (!Array.isArray(rows)) return { employeeNames, buckets: [], excludedRows }

  for (const row of rows) {
    if (excludedCallIds.size > 0 && excludedCallIds.has(String(row.id))) {
      excludedRows.push(row)
      continue
    }
    const name = row.employee ?? ""
    let employeeIdx = nameIndex.get(name)
    if (employeeIdx === undefined) {
      employeeIdx = employeeNames.length
      employeeNames.push(name)
      nameIndex.set(name, employeeIdx)
    }

    const h = hourOf(row.date)
    const b = Number(row.cqd_id) || 0
    const q = row.qualified === true ? 1 : row.qualified === false ? 0 : -1

    const key = `${employeeIdx}|${h}|${b}|${q}`
    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = { e: employeeIdx, h, b, q, d: 0, c: 0, p: 0, v: 0, pv: 0, a: 0, i: 0 }
      buckets.set(key, bucket)
    }

    const connected = Number(row.connected) === 1
    const pitched = Number(row.pitched) === 1
    const positive = Number(row.positive) === 1

    bucket.d++
    if (connected) bucket.c++
    if (pitched) bucket.p++
    if (positive) bucket.v++
    if (pitched && positive) bucket.pv++
    if (row.ApptSet != null && row.ApptSet > 0) bucket.a++
    if (row.Issued != null && row.Issued > 0) bucket.i++
  }

  return { employeeNames, buckets: Array.from(buckets.values()), excludedRows }
}

/**
 * Columns and row predicate for one drill-down table. The dashboard still applies
 * its own hour, employee and call-bucket filters, so those are never pre-applied.
 */
const DRILLDOWN_PROJECTIONS: Record<DrilldownTable, { fields: string[]; require: "connected" | "pitched" | null }> = {
  connection: { fields: ["id", "employee", "date", "connected"], require: null },
  dialsPerHour: { fields: ["id", "employee", "date", "result"], require: null },
  pitch: { fields: ["id", "employee", "date", "connected", "pitched"], require: "connected" },
  conversion: { fields: ["id", "employee", "date", "pitched", "positive", "qualified"], require: "pitched" },
  conversionQualified: {
    fields: ["id", "employee", "date", "pitched", "positive", "qualified", "lds_id", "cst_id", "cqd_id"],
    require: "pitched",
  },
  conversionUnqualified: {
    fields: ["id", "employee", "date", "pitched", "positive", "qualified", "lds_id", "cst_id", "cqd_id"],
    require: "pitched",
  },
}

export const SECONDARY_DRILLDOWNS: DrilldownTable[] = ["conversionQualified", "conversionUnqualified"]

export function projectDrilldownRows(rows: any[], table: string): any[] {
  const projection = DRILLDOWN_PROJECTIONS[table as DrilldownTable]
  if (!projection || !Array.isArray(rows)) return []

  const out: any[] = []
  for (const row of rows) {
    if (projection.require && Number(row[projection.require]) !== 1) continue
    const projected: Record<string, any> = {}
    for (const field of projection.fields) projected[field] = row[field] ?? null
    out.push(projected)
  }
  return out
}
