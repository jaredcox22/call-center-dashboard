"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, userDataLoading, isAdmin, userData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for both auth and user data to load
    if (!loading && !userDataLoading && !user) {
      router.push("/login")
      return
    }

    // Only redirect admin-only routes after user data is loaded
    if (!loading && !userDataLoading && user && adminOnly && !isAdmin) {
      router.push("/dashboard")
    }
  }, [user, loading, userDataLoading, router, adminOnly, isAdmin])

  // Show loading while auth or user data is loading
  if (loading || userDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Wait for user data before rendering admin-only routes
  if (adminOnly && !isAdmin) {
    return null
  }

  return <>{children}</>
}
