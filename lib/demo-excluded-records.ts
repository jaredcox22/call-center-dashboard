import type { ExcludableTableType } from "@/hooks/use-excluded-records"

const STORAGE_KEY = "demo_excluded_records"

export interface StoredDemoExcludedRecord {
  id: string
  tableType: ExcludableTableType
  recordId: string
  excludedAtMs: number
  excludedBy: string
}

function readStorage(): StoredDemoExcludedRecord[] {
  if (typeof window === "undefined") return []

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(records: StoredDemoExcludedRecord[]) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function loadDemoExcludedRecords(): StoredDemoExcludedRecord[] {
  return readStorage()
}

export function saveDemoExcludedRecords(records: StoredDemoExcludedRecord[]) {
  writeStorage(records)
}

export function clearDemoExcludedRecords() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}
