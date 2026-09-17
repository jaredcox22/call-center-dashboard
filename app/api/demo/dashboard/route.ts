import { NextResponse } from "next/server"
import demoFixture from "@/lib/demo-data/dashboard-fixture.json"
import {
  aggregateCallRows,
  projectDrilldownRows,
  SECONDARY_DRILLDOWNS,
  type DrilldownTable,
} from "@/lib/call-aggregates"

/**
 * The fixture holds raw call rows, while the live API returns pre-aggregated
 * buckets plus on-demand drill-down rows. This mirrors that contract so demo
 * users exercise the same client code path.
 */
const CALL_KEYS_BY_TAB = {
  setters: { primary: "settersCalls", secondary: "secondarySettersCalls" },
  gsp: { primary: "gspCalls", secondary: "secondaryGspCalls" },
  confirmers: { primary: "confirmersCalls", secondary: "secondaryConfirmersCalls" },
} as const

type Tab = keyof typeof CALL_KEYS_BY_TAB

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const fixture = demoFixture as Record<string, any>

  const rowsFor = params.get("rowsFor")
  if (rowsFor) {
    const requestedTab = params.get("tab") as Tab | null
    const tab: Tab = requestedTab && requestedTab in CALL_KEYS_BY_TAB ? requestedTab : "setters"
    const scope = SECONDARY_DRILLDOWNS.includes(rowsFor as DrilldownTable) ? "secondary" : "primary"
    return NextResponse.json({
      rowsFor,
      tab,
      rows: projectDrilldownRows(fixture[CALL_KEYS_BY_TAB[tab][scope]] ?? [], rowsFor),
    })
  }

  const excludedCallIds = new Set(
    (params.get("excludeCallIds") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  )

  const response = { ...fixture }
  for (const keys of Object.values(CALL_KEYS_BY_TAB)) {
    for (const callKey of Object.values(keys)) {
      if (!(callKey in response)) continue
      response[`${callKey}Aggregate`] = aggregateCallRows(response[callKey] ?? [], excludedCallIds)
      response[callKey] = []
    }
  }

  return NextResponse.json(response)
}
