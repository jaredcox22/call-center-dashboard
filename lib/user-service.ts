"use client"

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export interface UserData {
  email: string
  firstName: string
  lastName: string
  lpId: number | null
  role: "admin" | "agent"
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  lpId: number | null
  role: "admin" | "agent"
  password: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  lpId?: number | null
  role?: "admin" | "agent"
}

/**
 * Get user data from Firestore by UID
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    throw error
  }
}

/**
 * Create a user document in Firestore
 */
export async function createUserDocument(
  uid: string,
  userData: Omit<UserData, "createdAt" | "updatedAt">
): Promise<void> {
  try {
    const now = Timestamp.now()
    await setDoc(doc(db, "users", uid), {
      ...userData,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    throw error
  }
}

/**
 * Update user document in Firestore
 */
export async function updateUser(
  uid: string,
  updates: UpdateUserData
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    throw error
  }
}

/**
 * Delete user document from Firestore and Firebase Authentication
 */
export async function deleteUser(uid: string): Promise<void> {
  try {
    // Call API route to delete from both Firestore and Auth
    const response = await fetch("/api/users/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete user")
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get all users from Firestore
 */
export async function getAllUsers(): Promise<Array<{ uid: string; data: UserData }>> {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"))
    return usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      data: doc.data() as UserData,
    }))
  } catch (error) {
    throw error
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error
  }
}

