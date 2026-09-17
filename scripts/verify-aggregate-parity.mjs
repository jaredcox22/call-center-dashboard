/**
 * Proves the dashboard's metrics are unchanged after moving call aggregation to
 * the server.
 *
 *   node --experimental-strip-types scripts/verify-aggregate-parity.mjs [path-to.har]
 *
 * For each filter combination it computes the metrics the old way (scanning every
 * raw call row) and the new way (summing the aggregate buckets the API now
 * returns) and compares them, totals and per-employee. Runs against the demo
 * fixture by default, plus a captured production payload if a HAR path is given.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import {
  aggregateCallRows,
  summarizeCallAggregate,
  projectDrilldownRows,
  isHourInTimeRange,
} from '../lib/call-aggregates.ts'

const require = createRequire(import.meta.url)

const extractHour = (dateString) => new Date(dateString).getHours()

/** How the dashboard used to compute these numbers, straight off the raw rows. */
function metricsFromRawRows(rows, { employees = [], timeRange, callBuckets }) {
  let list = rows

  if (timeRange && (timeRange.startHour !== undefined || timeRange.endHour !== undefined)) {
    list = list.filter((c) => {
      if (!c.date) return false
      return isHourInTimeRange(extractHour(c.date), timeRange.startHour, timeRange.endHour)
    })
  }

  if (callBuckets && callBuckets.length > 0 && !callBuckets.includes('all')) {
    const hasNone = callBuckets.includes('none')
    const ids = new Set(callBuckets.filter((v) => v !== 'none').map((v) => Number(v)))
    list = list.filter((c) => {
      const noBucket = !c.cqd_id || c.cqd_id === 0
      return noBucket ? hasNone : ids.has(Number(c.cqd_id))
    })
  }

  if (employees.length > 0) {
    list = list.filter((c) => employees.includes(c.employee))
  }

  const pitched = list.filter((c) => c.pitched === 1)
  const perEmployee = {}
  for (const c of list) {
    const stats = (perEmployee[c.employee] ??= { dials: 0, connected: 0, pitched: 0, positive: 0 })
    stats.dials++
    if (c.connected === 1) stats.connected++
    if (c.pitched === 1) stats.pitched++
    if (c.positive === 1) stats.positive++
  }

  return {
    totals: {
      dials: list.length,
      connected: list.filter((c) => c.connected === 1).length,
      pitched: pitched.length,
      positive: list.filter((c) => c.positive === 1).length,
      qualified: pitched.filter((c) => c.qualified === true).length,
      unqualified: pitched.filter((c) => c.qualified === false).length,
      qualifiedConversions: pitched.filter((c) => c.qualified === true && c.positive === 1).length,
      unqualifiedConversions: pitched.filter((c) => c.qualified === false && c.positive === 1).length,
      apptSet: list.filter((c) => c.ApptSet != null && c.ApptSet > 0).length,
      issued: list.filter((c) => c.Issued != null && c.Issued > 0).length,
    },
    perEmployee,
  }
}

/** How the dashboard computes them now, from the server's aggregate buckets. */
function metricsFromAggregate(aggregate, { employees = [], timeRange, callBuckets }) {
  const { totals, byEmployee } = summarizeCallAggregate(aggregate, employees, timeRange, callBuckets)
  return { totals, perEmployee: Object.fromEntries(byEmployee) }
}

function runScenarios(label, rows) {
  const employees = Array.from(new Set(rows.map((c) => c.employee)))
  const bucketIds = Array.from(new Set(rows.map((c) => String(Number(c.cqd_id) || 0))))
  const aggregate = aggregateCallRows(rows)

  const scenarios = [
    ['no filters', {}],
    ['one employee', { employees: employees.slice(0, 1) }],
    ['three employees', { employees: employees.slice(0, 3) }],
    ['hours 9-17', { timeRange: { startHour: 9, endHour: 17 } }],
    ['hours 20-0 (to midnight)', { timeRange: { startHour: 20, endHour: 0 } }],
    ['call buckets subset', { callBuckets: bucketIds.slice(0, 5) }],
    ['call bucket "none"', { callBuckets: ['none'] }],
    ['call buckets "all"', { callBuckets: ['all'] }],
    ['employees + hours + buckets', {
      employees: employees.slice(0, 4),
      timeRange: { startHour: 8, endHour: 20 },
      callBuckets: [...bucketIds.slice(0, 5), 'none'],
    }],
  ]

  const rawBytes = JSON.stringify(rows).length
  const aggBytes = JSON.stringify(aggregate).length
  console.log(`\n${label}`)
  console.log(`  ${rows.length} rows, ${employees.length} employees`)
  console.log(`  raw ${(rawBytes / 1048576).toFixed(2)} MB -> aggregate ${(aggBytes / 1048576).toFixed(2)} MB` +
    ` (${aggregate.buckets.length} buckets, ${(rawBytes / aggBytes).toFixed(0)}x smaller)`)

  let failures = 0
  for (const [name, opts] of scenarios) {
    const expected = metricsFromRawRows(rows, opts)
    const actual = metricsFromAggregate(aggregate, opts)

    const diffs = Object.keys(expected.totals)
      .filter((k) => expected.totals[k] !== actual.totals[k])
      .map((k) => `${k}: raw=${expected.totals[k]} aggregate=${actual.totals[k]}`)

    for (const employee of new Set([...Object.keys(expected.perEmployee), ...Object.keys(actual.perEmployee)])) {
      const a = expected.perEmployee[employee]
      const b = actual.perEmployee[employee]
      if (!a || !b) { diffs.push(`perEmployee "${employee}" only present on one side`); continue }
      for (const k of ['dials', 'connected', 'pitched', 'positive']) {
        if (a[k] !== b[k]) diffs.push(`perEmployee "${employee}".${k}: raw=${a[k]} aggregate=${b[k]}`)
      }
    }

    if (diffs.length) {
      failures++
      console.log(`  MISMATCH ${name}`)
      for (const d of diffs) console.log(`      ${d}`)
    } else {
      console.log(`  ok       ${name.padEnd(28)} dials=${expected.totals.dials} pitched=${expected.totals.pitched}` +
        ` qual=${expected.totals.qualified} unqual=${expected.totals.unqualified}`)
    }
  }

  // Excluded calls must be dropped before aggregating, and reported back so the
  // exclusions panel can still show an accurate count.
  const excludedIds = new Set(rows.slice(0, Math.min(50, rows.length)).map((r) => String(r.id)))
  const withExclusions = aggregateCallRows(rows, excludedIds)
  const dialsAfter = withExclusions.buckets.reduce((sum, b) => sum + b.d, 0)
  const expectedAfter = rows.length - excludedIds.size
  if (dialsAfter !== expectedAfter || withExclusions.excludedRows.length !== excludedIds.size) {
    failures++
    console.log(`  MISMATCH exclusions: dials=${dialsAfter} (expected ${expectedAfter}),` +
      ` reported=${withExclusions.excludedRows.length} (expected ${excludedIds.size})`)
  } else {
    console.log(`  ok       ${'exclusions'.padEnd(28)} ${excludedIds.size} excluded, ${dialsAfter} dials remain`)
  }

  // Drill-down rows carry only the columns and rows their table renders
  for (const table of ['connection', 'dialsPerHour', 'pitch', 'conversion', 'conversionQualified']) {
    const projected = projectDrilldownRows(rows, table)
    const mb = (JSON.stringify(projected).length / 1048576).toFixed(2)
    console.log(`  rows     ${table.padEnd(28)} ${String(projected.length).padStart(7)} rows  ${mb.padStart(6)} MB`)
  }

  return failures
}

const sources = []

const fixture = require('../lib/demo-data/dashboard-fixture.json')
for (const key of ['settersCalls', 'secondarySettersCalls', 'confirmersCalls', 'secondaryConfirmersCalls']) {
  if (Array.isArray(fixture[key]) && fixture[key].length > 0) {
    sources.push([`demo fixture: ${key}`, fixture[key]])
  }
}

const harPath = process.argv[2]
if (harPath) {
  const har = JSON.parse(fs.readFileSync(harPath, 'utf8'))
  const entry = har.log.entries
    .filter((e) => e.response.content?.text)
    .sort((a, b) => b.response.content.size - a.response.content.size)[0]
  if (entry) {
    const payload = JSON.parse(entry.response.content.text)
    for (const key of ['secondarySettersCalls', 'secondaryGspCalls', 'secondaryConfirmersCalls', 'settersCalls']) {
      if (Array.isArray(payload[key]) && payload[key].length > 0) {
        sources.push([`captured payload: ${key}`, payload[key]])
      }
    }
  }
}

if (sources.length === 0) {
  console.error('no call rows found to verify against')
  process.exit(1)
}

let failures = 0
for (const [label, rows] of sources) failures += runScenarios(label, rows)

console.log('')
if (failures) {
  console.log(`${failures} mismatch(es)`)
  process.exit(1)
}
console.log('all scenarios match: aggregates reproduce the raw-row metrics exactly')
