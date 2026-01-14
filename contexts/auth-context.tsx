"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { SessionManager } from "@/lib/session-manager"
import { getUserData, type UserData, sendPasswordReset } from "@/lib/user-service"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  userDataLoading: boolean
  isAdmin: boolean
  isAgent: boolean
  lpId: number | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userDataLoading, setUserDataLoading] = useState(false)

  const fetchUserData = async (uid: string) => {
    setUserDataLoading(true)
    try {
      const data = await getUserData(uid)
      setUserData(data)
    } catch (error) {
      setUserData(null)
    } finally {
      setUserDataLoading(false)
    }
  }

  useEffect(() => {
    // Check if session is expired before initializing
    if (SessionManager.isSessionExpired()) {
      SessionManager.clearSession()
      if (auth.currentUser) {
        signOut(auth) // Force logout if expired
      }
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Update activity when user state changes
        SessionManager.updateActivity()
        // Fetch user data from Firestore
        await fetchUserData(firebaseUser.uid)
      } else {
        setUserData(null)
      }
      setUser(firebaseUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setUserDataLoading(true)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    SessionManager.updateActivity() // Set initial activity
    // Fetch user data immediately to ensure it's ready before redirect
    await fetchUserData(userCredential.user.uid)
  }

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
    SessionManager.updateActivity() // Set initial activity
    // User data will be fetched by onAuthStateChanged
  }

  const logout = async () => {
    SessionManager.clearSession() // Clear activity tracking
    setUserData(null)
    await signOut(auth)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error("User must be authenticated to change password")
    }

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(user.email!, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)
  }

  const handleSendPasswordReset = async (email: string) => {
    await sendPasswordReset(email)
  }

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid)
    }
  }

  const isAdmin = userData?.role === "admin"
  const isAgent = userData?.role === "agent"
  const lpId = userData?.lpId ?? null

  const value = {
    user,
    userData,
    loading,
    userDataLoading,
    isAdmin,
    isAgent,
    lpId,
    signIn,
    signUp,
    logout,
    changePassword,
    sendPasswordReset: handleSendPasswordReset,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
