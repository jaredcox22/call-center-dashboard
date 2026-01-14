"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

// Table types that support exclusion
export type ExcludableTableType =
  | "stl"
  | "conversion"
  | "pitch"
  | "connection"
  | "dialsPerHour"
  | "grossIssue"
  | "conversionQualified"
  | "conversionUnqualified"

// Document structure for excluded records in Firestore
export interface ExcludedRecord {
  id: string // Firestore document ID
  tableType: ExcludableTableType
  recordId: string // The unique identifier from the original record
  excludedAt: Timestamp
  excludedBy: string // User email
}

// Internal state structure
interface ExcludedRecordsState {
  records: ExcludedRecord[]
  loading: boolean
  error: Error | null
}

export function useExcludedRecords() {
  const { user } = useAuth()
  const [state, setState] = useState<ExcludedRecordsState>({
    records: [],
    loading: true,
    error: null,
  })

  // Subscribe to excluded records collection
  useEffect(() => {
    const excludedRecordsRef = collection(db, "excludedRecords")

    const unsubscribe = onSnapshot(
      excludedRecordsRef,
      (snapshot) => {
        const records: ExcludedRecord[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          tableType: doc.data().tableType as ExcludableTableType,
          recordId: doc.data().recordId,
          excludedAt: doc.data().excludedAt,
          excludedBy: doc.data().excludedBy,
        }))

        setState({
          records,
          loading: false,
          error: null,
        })
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }))
      }
    )

    return () => unsubscribe()
  }, [])

  // Get excluded records for a specific table type
  const getExcludedForTable = useCallback(
    (tableType: ExcludableTableType): ExcludedRecord[] => {
      return state.records.filter((record) => record.tableType === tableType)
    },
    [state.records]
  )

  // Get excluded record IDs for a specific table type (for quick lookup)
  const getExcludedIdsForTable = useCallback(
    (tableType: ExcludableTableType): Set<string> => {
      return new Set(
        state.records
          .filter((record) => record.tableType === tableType)
          .map((record) => record.recordId)
      )
    },
    [state.records]
  )

  // Check if a specific record is excluded
  const isExcluded = useCallback(
    (tableType: ExcludableTableType, recordId: string): boolean => {
      return state.records.some(
        (record) =>
          record.tableType === tableType && record.recordId === recordId
      )
    },
    [state.records]
  )

  // Exclude multiple records (bulk operation)
  const excludeRecords = useCallback(
    async (tableType: ExcludableTableType, recordIds: string[]) => {
      if (!user?.email) {
        throw new Error("User must be authenticated to exclude records")
      }

      const batch = writeBatch(db)
      const excludedRecordsRef = collection(db, "excludedRecords")

      for (const recordId of recordIds) {
        // Skip if already excluded
        if (isExcluded(tableType, recordId)) continue

        const docRef = doc(excludedRecordsRef)
        batch.set(docRef, {
          tableType,
          recordId,
          excludedAt: Timestamp.now(),
          excludedBy: user.email,
        })
      }

      await batch.commit()
    },
    [user?.email, isExcluded]
  )

  // Exclude a single record
  const excludeRecord = useCallback(
    async (tableType: ExcludableTableType, recordId: string) => {
      if (!user?.email) {
        throw new Error("User must be authenticated to exclude records")
      }

      // Skip if already excluded
      if (isExcluded(tableType, recordId)) return

      const excludedRecordsRef = collection(db, "excludedRecords")
      await addDoc(excludedRecordsRef, {
        tableType,
        recordId,
        excludedAt: Timestamp.now(),
        excludedBy: user.email,
      })
    },
    [user?.email, isExcluded]
  )

  // Restore multiple records (bulk operation)
  const restoreRecords = useCallback(
    async (tableType: ExcludableTableType, recordIds: string[]) => {
      const batch = writeBatch(db)

      for (const recordId of recordIds) {
        const record = state.records.find(
          (r) => r.tableType === tableType && r.recordId === recordId
        )
        if (record) {
          const docRef = doc(db, "excludedRecords", record.id)
          batch.delete(docRef)
        }
      }

      await batch.commit()
    },
    [state.records]
  )

  // Restore a single record
  const restoreRecord = useCallback(
    async (tableType: ExcludableTableType, recordId: string) => {
      const record = state.records.find(
        (r) => r.tableType === tableType && r.recordId === recordId
      )
      if (record) {
        const docRef = doc(db, "excludedRecords", record.id)
        await deleteDoc(docRef)
      }
    },
    [state.records]
  )

  // Restore by Firestore document ID (for use in the panel)
  const restoreByDocId = useCallback(async (docId: string) => {
    const docRef = doc(db, "excludedRecords", docId)
    await deleteDoc(docRef)
  }, [])

  // Bulk restore by Firestore document IDs
  const restoreByDocIds = useCallback(async (docIds: string[]) => {
    const batch = writeBatch(db)

    for (const docId of docIds) {
      const docRef = doc(db, "excludedRecords", docId)
      batch.delete(docRef)
    }

    await batch.commit()
  }, [])

  // Memoized grouped records by table type (for the panel)
  const recordsByTableType = useMemo(() => {
    const grouped: Record<ExcludableTableType, ExcludedRecord[]> = {
      stl: [],
      conversion: [],
      pitch: [],
      connection: [],
      dialsPerHour: [],
      grossIssue: [],
      conversionQualified: [],
      conversionUnqualified: [],
    }

    for (const record of state.records) {
      grouped[record.tableType].push(record)
    }

    return grouped
  }, [state.records])

  return {
    // State
    excludedRecords: state.records,
    recordsByTableType,
    loading: state.loading,
    error: state.error,
    totalExcluded: state.records.length,

    // Query methods
    getExcludedForTable,
    getExcludedIdsForTable,
    isExcluded,

    // Mutation methods
    excludeRecord,
    excludeRecords,
    restoreRecord,
    restoreRecords,
    restoreByDocId,
    restoreByDocIds,
  }
}


